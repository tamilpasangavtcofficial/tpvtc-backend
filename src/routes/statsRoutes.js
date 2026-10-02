const express = require('express');
const axios = require('axios');
const cron = require('node-cron');
const Stat = require('../models/Stat');
const router = express.Router();

let isSyncing = false;
let syncProgress = 0;

const syncStats = async () => {
    if (isSyncing) return;
    isSyncing = true;
    syncProgress = 0;
    try {
        console.log('Starting full stats sync from TruckersHub...');
        const headers = { 
            'Content-Type': 'application/json', 
            'Authorization': 'Y1gMxXVAWcx0qddSv01wLvcedPKgrngVErTh9DLB' 
        };
        
        let drivers = {};
        let monthlyStats = {}; // { 'YYYY-MM': { jobs: 0, distance: 0, income: 0 } }
        let totalJobs = 0;
        let totalDistance = 0;
        let totalIncome = 0;
        let totalPages = 1;
        
        let page = 1;
        while (true) {
            console.log(`Fetching TruckersHub page ${page}...`);
            const res = await axios.get(`https://api.truckershub.in/v1/jobs?page=${page}`, { headers });
            
            if (page === 1 && res.data.links && res.data.links.last) {
                const match = res.data.links.last.match(/page=(\d+)/);
                if (match) totalPages = parseInt(match[1]);
            }
            
            const jobs = res.data.data;
            if (!jobs || jobs.length === 0) break;
            
            syncProgress = Math.min(80, Math.round((page / totalPages) * 80)); // 80% for TruckersHub fetch
            
            for (let job of jobs) {
                if (job.jobStatus !== 'Completed') continue;
                
                // Aggregations
                const distance = job.distanceDriven || 0;
                const income = job.income || 0;
                
                // Monthly Grouping
                const jobTime = job.realtime?.end || job.realtime?.start;
                if (jobTime) {
                    const date = new Date(jobTime);
                    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
                    if (!monthlyStats[monthKey]) {
                        monthlyStats[monthKey] = { jobs: 0, distance: 0, income: 0, month: monthKey };
                    }
                    monthlyStats[monthKey].jobs += 1;
                    monthlyStats[monthKey].distance += distance;
                    monthlyStats[monthKey].income += income;
                }
                
                // Driver Grouping
                const driverId = job.driver.steamID;
                if (!drivers[driverId]) {
                    drivers[driverId] = {
                        username: job.driver.username,
                        steamID: job.driver.steamID,
                        avatar: job.driver.avatar,
                        jobs: 0,
                        distance: 0,
                        income: 0,
                        tmpData: null
                    };
                }
                
                drivers[driverId].jobs += 1;
                drivers[driverId].distance += distance;
                drivers[driverId].income += income;
                
                totalJobs++;
                totalDistance += distance;
                totalIncome += income;
            }
            
            // TruckersHub paginates to next page
            if (!res.data.links || !res.data.links.next) {
                break;
            }
            page++;
        }

        console.log(`Finished fetching ${page} pages. Now fetching TMP data...`);

        // Fetch TMP data for drivers
        const driverIds = Object.keys(drivers);
        const totalDrivers = driverIds.length;
        
        for (let i = 0; i < totalDrivers; i++) {
            const id = driverIds[i];
            try {
                const tmpRes = await axios.get(`https://api.truckersmp.com/v2/player/${id}`);
                drivers[id].tmpData = tmpRes.data.response;
            } catch (e) {
                // ignore 404s
            }
            syncProgress = 80 + Math.round(((i + 1) / totalDrivers) * 20); // remaining 20%
        }

        // Sort monthly stats by date
        const sortedMonths = Object.values(monthlyStats).sort((a, b) => a.month.localeCompare(b.month));

        const aggregatedStats = {
            overview: { totalJobs, totalDistance, totalIncome },
            monthly: sortedMonths,
            drivers: Object.values(drivers).sort((a, b) => b.distance - a.distance)
        };

        // Save to DB
        let statRecord = await Stat.findOne({ where: { key: 'vtc_analytics' } });
        if (statRecord) {
            statRecord.data = aggregatedStats;
            statRecord.lastSync = new Date();
            await statRecord.save();
        } else {
            await Stat.create({
                key: 'vtc_analytics',
                data: aggregatedStats,
                lastSync: new Date()
            });
        }

        console.log('Stats sync completed and saved to database successfully!');
    } catch (err) {
        console.error('Stats sync error:', err.message);
    } finally {
        isSyncing = false;
    }
};

// Schedule sync everyday at 12:00 AM
cron.schedule('0 0 * * *', () => {
    console.log('Running daily 12 AM stats sync...');
    syncStats();
});

// Run once on startup so we have data if DB is empty
setTimeout(async () => {
    const statRecord = await Stat.findOne({ where: { key: 'vtc_analytics' } });
    if (!statRecord) {
        syncStats();
    }
}, 5000); 

router.get('/sync', async (req, res) => {
    if (!isSyncing) {
        syncStats();
    }
    const statRecord = await Stat.findOne({ where: { key: 'vtc_analytics' } });
    res.json({ 
        message: 'Sync started in background', 
        isSyncing: true, 
        syncProgress,
        lastSync: statRecord ? statRecord.lastSync : null 
    });
});

router.get('/', async (req, res) => {
    try {
        const statRecord = await Stat.findOne({ where: { key: 'vtc_analytics' } });
        if (!statRecord) {
            return res.status(202).json({ message: 'Stats are being aggregated. Try again later.', syncing: true, syncProgress });
        }
        let parsedData = statRecord.data;
        if (typeof parsedData === 'string') {
            try { parsedData = JSON.parse(parsedData); } catch (e) {}
        }
        res.json({ stats: parsedData, lastSync: statRecord.lastSync, isSyncing, syncProgress });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Error fetching stats' });
    }
});

module.exports = router;
