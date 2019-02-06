const log = require('winston');
const db = require('@ampapps/pdrc-db');
require('@ampapps/pdrc-env');

module.exports = async() => {
    try {
        await db.init();
        
        const patients = await db.getAllPatients();


        let cityData = {};
        for(const patient of patients){
            const patientCity = patient.city;
            if(cityData[patientCity]){
                cityData[patientCity] = cityData[patientCity] + 1;
            }else{
                cityData[patientCity] = 1;
            }
        }

        await db.updateReportData('cityBreakdown', cityData);

        let zipCodeData = {};
        for(const patient of patients){
            const patientzipCode = patient.zip;
            if(zipCodeData[patientzipCode]){
                zipCodeData[patientzipCode] = zipCodeData[patientzipCode] + 1;
            }else{
                zipCodeData[patientzipCode] = 1;
            }
        }

        await db.updateReportData('zipCodeBreakdown', zipCodeData);

        
        log.info('Generate report data task succeeded');
        db.close();
    } catch (err) {
        log.error(err);
    }
};
