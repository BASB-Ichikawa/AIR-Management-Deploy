var mysql = require('mysql');
var dbHelper = require('../utilities/dbhelper');

exports.getCreatedHouseNumByWeek = () => {
    const query = 'SELECT DATE_FORMAT(created_at, "%w") as date, COUNT(*) as count FROM houses WHERE is_deleted = 0 AND (created_at BETWEEN ? AND ?) GROUP BY DATE_FORMAT(created_at, "%w");';

    // 日曜始まりが前提
    const weekNumber = getWeekNumber(new Date(), 1);    // 第何週
    let firstDow = getFirstDayInWeek(new Date(), 1);    // 指定日の月初め
    firstDow.setDate(firstDow.getDate() + 7 * (weekNumber - 1));
    
    const end = new Date(firstDow);
    end.setDate(firstDow.getDate() + 6);

    const startDate = firstDow.getFullYear() + '-' + (firstDow.getMonth() + 1) + '-' +  firstDow.getDate();
    const endDate = end.getFullYear() + '-' +  (end.getMonth() + 1) + '-' +  end.getDate();

    var sql = mysql.format(query, [startDate, endDate]);

    return dbHelper.execute(sql);
};

exports.getCreatedHouseNumByMonth = () => {
    const query = 'SELECT DATE_FORMAT(created_at, "%m") as date, COUNT(*) as count FROM houses WHERE is_deleted = 0 AND (created_at BETWEEN ? AND ?) GROUP BY DATE_FORMAT(created_at, "%m");';

    let start = new Date();
    start.setMonth(start.getMonth() - 12);
    
    const startMonth = start.getFullYear() + '-' + (start.getMonth() + 2) + '-01';
    // TODO 当該月の最終日にする
    const endMonth = new Date().getFullYear() + '-' +  (new Date().getMonth() + 2) + '-01';

    var sql = mysql.format(query, [startMonth, endMonth]);
    
    return dbHelper.execute(sql);
};


function getWeekNumber(tdate, dow) {
    firstDow = getFirstDow(tdate, dow);
 
    if (tdate < firstDow) {
        lmdate = new Date(tdate);
        lmdate.setMonth(lmdate.getMonth() - 1);
        firstDow = getFirstDow(lmdate, dow);
    }
    var thisDow = new Date(tdate.getTime()); // その週の指定曜日
    thisDow.setDate(thisDow.getDate() - (thisDow.getDay() + (7 - dow)) % 7);
 
    var weekNum = Math.floor((thisDow.getDate() - firstDow.getDate()) / 7 + 1);
    
    return weekNum;
}

function getFirstDayInWeek(tdate, dow) {
    let firstDow = getFirstDow(tdate, dow);
 
    if (tdate < firstDow) {
        let lmdate = new Date(tdate);
        lmdate.setMonth(lmdate.getMonth() - 1);
        firstDow = getFirstDow(lmdate, dow);
    }
        
    return firstDow;
}

function getFirstDow(tdate, dow) {
    var firstDay = new Date(tdate);
    firstDay.setDate(1); // 1日
 
    var firstDow = new Date(firstDay.getTime()); // 月最初の指定曜日
    while (firstDow.getDay() !== dow) {
        firstDow.setDate(firstDow.getDate() + 1);
    }
    
    return firstDow;
}
