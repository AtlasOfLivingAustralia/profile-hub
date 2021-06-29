package au.org.ala.profile.hub

import au.org.ala.profile.hub.util.DateRangeType

import java.text.SimpleDateFormat

class UtilService {

    /**
     * Gets the to and from date for a specific period.
     * @param period
     * @param from
     * @param to
     * @return a Map containing the keys "to" and "from" both containing dates formatted
     * in the style "MMMM dd, YYYY".
     */
    def getDateRange(DateRangeType dr, Date from, Date to) {
        Map result = [:];
        Date today = today();
        SimpleDateFormat sdf = new SimpleDateFormat('MMMMM dd, YYYY');
        switch (dr) {
            case DateRangeType.TODAY:
                result['to'] = addDayToDate(today, 1)
                result['from'] = today
                break;
            case DateRangeType.LAST_7DAYS:
                result['to'] = addDayToDate(today, 1)
                result['from'] = addDayToDate(today, -6)
                break;
            case DateRangeType.LAST_30DAYS:
                result['to'] = addDayToDate(today, 1)
                result['from'] = addDayToDate(today, -29)
                break;
            case DateRangeType.CUSTOM:
                result['to'] = to;
                result['from'] = from;
                break;
        }

        result['to'] = sdf.format(result['to']);
        result['from'] = sdf.format(result['from']);
        result;
    }

    Date today() {
        Date now = new Date();
        Date today = new Date(now.getYear(), now.getMonth(), now.getDate());
    }

    /**
     * Add number of days to a reference date. To subtract add negative value.
     * @param date
     * @param days
     * @return
     */
    Date addDayToDate(Date date, Integer days) {
        Calendar cal = Calendar.getInstance();
        cal.setTime(date);
        cal.add(Calendar.DATE, days);
        cal.getTime();
    }
}
