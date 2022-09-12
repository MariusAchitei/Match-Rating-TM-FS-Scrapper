function convertMonthToNum(month) {
    switch (month.toUpperCase()) {
        case 'JAN': {
            return 1; break;
        }
        case 'FEB': {
            return 2; break;
        }
        case 'MAR': {
            return 3; break;
        }
        case 'APR': {
            return 4; break;
        }
        case 'MAY': {
            return 5; break;
        }
        case 'JUN': {
            return 6; break;
        }
        case 'JUL': {
            return 7; break;
        }
        case 'AUG': {
            return 8; break;
        }
        case 'SEP': {
            return 9; break;
        }
        case 'OCT': {
            return 10; break;
        }
        case 'NOV': {
            return 11; break;
        }
        case 'DEC': {
            return 12; break;
        }
    }
}

function convertDateToArrTM(date) {
    if (!date) return {}
    //console.log(date)
    const arr = date.trim().toUpperCase().replaceAll(',', '').split(' ')

    if (arr[4] == 'PM') {
        ora = arr[3].split(':')
        ora[0] = parseInt(ora[0]) + 12
        arr[3] = ora.join(':');
        console.log(ora)
    }


    const exactDate = {
        month: convertMonthToNum(arr[0]),
        day: parseInt(arr[1]),
        year: parseInt(arr[2]),
        hour: arr[3]

    }
    //exactDate.month = convertMonthToNum(arr[0])
    return (exactDate)

}

function convertDateToArrFS(date) {
    if (!date) return {}
    const arr = date.trim().toUpperCase().replaceAll(' ', '.').split('.')
    const exactDate = {
        month: parseInt(arr[1]),
        day: parseInt(arr[0]),
        year: parseInt(arr[2]),
        hour: arr[3]
    }
    //exactDate.month = convertMonthToNum(arr[0])
    return exactDate

}
function convertDateToArrFsShort(date) {
    if (!date) return {}
    const arr = date.trim().toUpperCase().replaceAll('. ', '.').split('.')
    const exactDate = {
        month: parseInt(arr[1]),
        day: parseInt(arr[0]),
        // year: parseInt(arr[2]),
        hour: arr[2]
    }
    //exactDate.month = convertMonthToNum(arr[0])
    return exactDate

}

//convertDateToArrFS('18.08. 19:00')

module.exports = { convertDateToArrTM, convertDateToArrFS, convertMonthToNum, convertDateToArrFsShort }