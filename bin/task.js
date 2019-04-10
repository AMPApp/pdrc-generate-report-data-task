const log = require('winston');
const db = require('@ampapps/pdrc-db');
require('@ampapps/pdrc-env');

module.exports = async() => {
    try {
        await db.init();
        
        const patients = await db.getAllPatients();
        const providers = await db.getAllProviders();
        const communities = await db.getAllCommunities();


        let cityData = {};
        for(const patient of patients){
            if(patient.type === 'patient'){
              const patientCity = patient.city;
              if(cityData[patientCity]){
                cityData[patientCity] = cityData[patientCity] + 1;
              }else{
                cityData[patientCity] = 1;
              }
            }
        }

        await db.updateReportData('cityBreakdown', cityData);

        let zipCodeData = {};
        for(const patient of patients){
          if(patient.type === 'patient') {
            let patientzipCode = patient.zip;
            // chop off zip with more than 5 chars
            if(patientzipCode && patientzipCode.length > 5){
              patientzipCode = patientzipCode.slice(0,5);
            }
            if (zipCodeData[patientzipCode]) {
              zipCodeData[patientzipCode] = zipCodeData[patientzipCode] + 1;
            } else {
              zipCodeData[patientzipCode] = 1;
            }
          }
        }

        await db.updateReportData('zipCodeBreakdown', zipCodeData);

        let totals = {
            patient: {
                type: {
                    caregiver: 0,
                    patient: 0,
                    unspecified: 0
                },
                contactMethod: {
                    phone: 0,
                    email: 0,
                    directmail: 0,
                    facetoface: 0,
                    unspecified: 0
                },
                contactStatus: {
                    notContacted: 0,
                    initialContact: 0,
                    initialContactSecondAttempt: 0,
                    followupOngoing: 0,
                    followupReengagement: 0,
                    unspecified: 0
                }
            }
        };

        for(const patient of patients){
            if (patient.type === 'Patient') {
                totals.patient.type.patient = totals.patient.type.patient + 1;
            } else if(patient.type === 'Caregiver'){
                totals.patient.type.caregiver = totals.patient.type.caregiver + 1;
            } else {
                totals.patient.type.unspecified = totals.patient.type.unspecified + 1;
            }

            if (patient.contactMethod === 'phone') {
                totals.patient.contactMethod.phone = totals.patient.contactMethod.phone + 1;
            } else if(patient.contactMethod === 'email'){
                totals.patient.contactMethod.email = totals.patient.contactMethod.email + 1;
            } else if(patient.type === 'directmail'){
                totals.patient.contactMethod.directmail = totals.patient.contactMethod.directmail + 1;
            } else if(patient.contactMethod === 'facetoface'){
                totals.patient.contactMethod.facetoface = totals.patient.contactMethod.facetoface + 1;
            } else {
                totals.patient.contactMethod.unspecified = totals.patient.contactMethod.unspecified + 1;
            }

            if (patient.contactStatus === 'notContacted') {
                totals.patient.contactStatus.notContacted = totals.patient.contactStatus.notContacted + 1;
            } else if(patient.contactStatus === 'initialContact'){
                totals.patient.contactStatus.initialContact = totals.patient.contactStatus.initialContact + 1;
            } else if(patient.type === 'initialContactSecondAttempt'){
                totals.patient.contactStatus.initialContactSecondAttempt = totals.patient.contactStatus.initialContactSecondAttempt + 1;
            } else if(patient.contactStatus === 'followupOngoing'){
                totals.patient.contactStatus.followupOngoing = totals.patient.contactStatus.followupOngoing + 1;
            } else if(patient.contactStatus === 'followupReengagement'){
                totals.patient.contactStatus.followupReengagement = totals.patient.contactStatus.followupReengagement + 1;
            } else {
                totals.patient.contactStatus.unspecified = totals.patient.contactStatus.unspecified + 1;
            }
        }

        totals.provider = {
            total: providers.length
        };

        totals.community = {
            type: {
                supportGroup: 0
            }
        };

        for(const community of communities){
            if(community.type === 'Support Group'){
                totals.community.type.supportGroup = totals.community.type.supportGroup + 1;
            }
        }

        await db.updateReportData('totals', totals);

        
        log.info('Generate report data task succeeded');
        db.close();
    } catch (err) {
        log.error(err);
    }
};
