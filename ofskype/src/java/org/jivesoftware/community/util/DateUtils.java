/**
 * $Revision $
 * $Date $
 *
 * Copyright (C) 2005-2010 Jive Software. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package org.jivesoftware.community.util;

import java.text.ParseException;
import java.text.SimpleDateFormat;
import java.util.*;
import javax.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.jivesoftware.util.*;

public class DateUtils
{
    private static final Logger log = LoggerFactory.getLogger(DateUtils.class);

    public static final String DEFAULT_DATE_PATTERN = "MM/dd/yyyy";
    private TimeZone timeZone;
    private FastDateFormat dateFormat;
    private FastDateFormat shortDateFormat;
    private FastDateFormat mediumDateFormat;
    private FastDateFormat longDateFormat;
    private FastDateFormat fullDateFormat;
    private FastDateFormat timeFormat;
    private FastDateFormat shortTimeFormat;
    private FastDateFormat mediumTimeFormat;
    private FastDateFormat longTimeFormat;
    private FastDateFormat fullTimeFormat;
    private Locale locale;
    public static final long DURATION_DAY_S = 0x4f1a00L;

    public DateUtils(HttpServletRequest request)
    {
        locale = JiveGlobals.getLocale();
        timeZone = JiveGlobals.getTimeZone();
    }

    public DateUtils(Locale locale, TimeZone timeZone)
    {
        this.locale = locale;
        this.timeZone = timeZone;
    }

    public DateUtils()
    {
        locale = JiveGlobals.getLocale();
        timeZone = JiveGlobals.getTimeZone();
    }

    public TimeZone getTimeZone()
    {
        return timeZone;
    }

    public String formatDate(Date date)
    {
        if(date == null)
            return "";
        else
            return getDateFormat().format(date);
    }

    public String getFullFormatDate()
    {
        return getFullFormatDate(new Date());
    }

    public String getFullFormatDate(Date date)
    {
        if(date == null)
            return "";
        else
            return getFullDateFormat().format(date);
    }

    public String getLongFormatDate()
    {
        return getLongFormatDate(new Date());
    }

    public String getLongFormatDate(Date date)
    {
        if(date == null)
            return "";
        else
            return getLongDateFormat().format(date);
    }

    public String getMediumFormatDate()
    {
        return getMediumFormatDate(new Date());
    }

    public String getMediumFormatDate(Date date)
    {
        if(date == null)
            return "";
        else
            return getMediumDateFormat().format(date);
    }

    public String getShortFormatDate()
    {
        return getShortFormatDate(new Date());
    }

    public String getShortFormatDate(Date date)
    {
        if(date == null)
            return "";
        else
            return getShortDateFormat().format(date);
    }

    public static String getDatePattern()
    {
        return JiveGlobals.getProperty("date.defaultPattern", "MM/dd/yyyy");
    }

    public FastDateFormat getDateFormat()
    {
        if(dateFormat == null)
            dateFormat = FastDateFormat.getDateTimeInstance(FastDateFormat.MEDIUM, FastDateFormat.SHORT, getTimeZone(), getLocale());
        return dateFormat;
    }

    public FastDateFormat getFullDateFormat()
    {
        if(fullDateFormat == null)
            fullDateFormat = FastDateFormat.getDateInstance(FastDateFormat.FULL, getTimeZone(), getLocale());
        return fullDateFormat;
    }

    public FastDateFormat getLongDateFormat()
    {
        if(longDateFormat == null)
            longDateFormat = FastDateFormat.getDateInstance(FastDateFormat.LONG, getTimeZone(), getLocale());
        return longDateFormat;
    }

    public FastDateFormat getMediumDateFormat()
    {
        if(mediumDateFormat == null)
            mediumDateFormat = FastDateFormat.getDateInstance(FastDateFormat.MEDIUM, getTimeZone(), getLocale());
        return mediumDateFormat;
    }

    public FastDateFormat getShortDateFormat()
    {
        if(shortDateFormat == null)
            shortDateFormat = FastDateFormat.getDateInstance(FastDateFormat.SHORT, getTimeZone(), getLocale());
        return shortDateFormat;
    }

    public FastDateFormat getTimeFormat()
    {
        if(timeFormat == null)
            timeFormat = FastDateFormat.getTimeInstance(FastDateFormat.MEDIUM, getTimeZone(), getLocale());
        return timeFormat;
    }

    public FastDateFormat getFullTimeFormat()
    {
        if(fullTimeFormat == null)
            fullTimeFormat = FastDateFormat.getTimeInstance(FastDateFormat.FULL, getTimeZone(), getLocale());
        return fullTimeFormat;
    }

    public FastDateFormat getLongTimeFormat()
    {
        if(longTimeFormat == null)
            longTimeFormat = FastDateFormat.getTimeInstance(FastDateFormat.LONG, getTimeZone(), getLocale());
        return longTimeFormat;
    }

    public FastDateFormat getMediumTimeFormat()
    {
        if(mediumTimeFormat == null)
            mediumTimeFormat = FastDateFormat.getTimeInstance(FastDateFormat.MEDIUM, getTimeZone(), getLocale());
        return mediumTimeFormat;
    }

    public FastDateFormat getShortTimeFormat()
    {
        if(shortTimeFormat == null)
            shortTimeFormat = FastDateFormat.getTimeInstance(FastDateFormat.SHORT, getTimeZone(), getLocale());
        return shortTimeFormat;
    }

    public String getFullFormatTime(Date date)
    {
        if(date == null)
            return "";
        else
            return getFullTimeFormat().format(date);
    }

    public String getLongFormatTime(Date date)
    {
        if(date == null)
            return "";
        else
            return getLongTimeFormat().format(date);
    }

    public String getMediumFormatTime(Date date)
    {
        if(date == null)
            return "";
        else
            return getMediumTimeFormat().format(date);
    }

    public String getShortFormatTime(Date date)
    {
        if(date == null)
            return "";
        else
            return getShortTimeFormat().format(date);
    }

    public Date toUserStartOfDay(Date date)
    {
        Calendar calendar = Calendar.getInstance(getTimeZone());
        calendar.setTime(date);
        toStartOfDay(calendar);
        return calendar.getTime();
    }

    public Date toUserEndOfDay(Date date)
    {
        Calendar calendar = Calendar.getInstance(getTimeZone());
        calendar.setTime(date);
        toEndOfDay(calendar);
        return calendar.getTime();
    }

    private Locale getLocale()
    {
        return locale;
    }

    public static Date roundDate(Date date, int seconds)
    {
        return new Date(roundDate(date.getTime(), seconds));
    }

    public static long roundDate(long date, int seconds)
    {
        return date - date % (long)(1000 * seconds);
    }

    public static Date getMaxDate()
    {
        return new Date(0x38d7ea4c67fffL);
    }

    public static Date daysLater(int days, Calendar from)
    {
        from.add(6, days);
        return from.getTime();
    }

    public static Date daysLater(int days, long from)
    {
        Calendar date = Calendar.getInstance();
        date.setTimeInMillis(from);
        return daysLater(days, date);
    }

    public static Date daysBefore(int days, long from)
    {
        Calendar date = Calendar.getInstance();
        date.setTimeInMillis(from);
        return daysLater(-1 * days, date);
    }

    public static Date daysBefore(int days, Calendar from)
    {
        from.add(6, -1 * days);
        return from.getTime();
    }

    public static Date daysBefore(int days)
    {
        return daysBefore(days, System.currentTimeMillis());
    }

    public static Date daysLater(int days)
    {
        return daysLater(days, System.currentTimeMillis());
    }

    public static Date today()
    {
        Calendar date = Calendar.getInstance();
        toMidnight(date);
        return date.getTime();
    }

    public static Date now()
    {
        return Calendar.getInstance().getTime();
    }

    private static void toMidnight(Calendar date)
    {
        date.set(11, 0);
        date.set(12, 0);
        date.set(13, 0);
        date.set(14, 0);
    }

    public static Date toMidnight(Date date)
    {
        Calendar calendar = Calendar.getInstance();
        calendar.setTime(date);
        toMidnight(calendar);
        return calendar.getTime();
    }

    private static void toStartOfDay(Calendar date)
    {
        date.set(11, 0);
        date.set(12, 0);
        date.set(13, 0);
        date.set(14, 0);
    }

    public static Date toStartOfDay(Date date)
    {
        Calendar calendar = Calendar.getInstance();
        calendar.setTime(date);
        toStartOfDay(calendar);
        return calendar.getTime();
    }

    private static void toEndOfDay(Calendar date)
    {
        date.set(11, 23);
        date.set(12, 59);
        date.set(13, 59);
        date.set(14, 999);
    }

    public static Date toEndOfDay(Date date)
    {
        Calendar calendar = Calendar.getInstance();
        calendar.setTime(date);
        toEndOfDay(calendar);
        return calendar.getTime();
    }

    public static Date hoursLater(int i, Date from)
    {
        return later(i, 11, from);
    }

    public static Date minutesLater(int i, Date from)
    {
        return later(i, 12, from);
    }

    public static Date secondsLater(int i, Date from)
    {
        return later(i, 13, from);
    }

    private static Date later(int i, int field, Date from)
    {
        Calendar date = toCalendar(from);
        date.add(field, i);
        return date.getTime();
    }

    public static Date hoursBefore(int i, Date from)
    {
        return before(i, 11, from);
    }

    public static Date minutesBefore(int i, Date from)
    {
        return before(i, 12, from);
    }

    public static Date secondsBefore(int i, Date from)
    {
        return before(i, 13, from);
    }

    private static Date before(int i, int field, Date from)
    {
        Calendar date = toCalendar(from);
        date.add(field, -1 * i);
        return date.getTime();
    }

    private static Calendar toCalendar(Date date)
    {
        Calendar calendar = Calendar.getInstance();
        calendar.setTimeInMillis(date.getTime());
        return calendar;
    }

    public static Date yesterday()
    {
        return daysLater(-1, today().getTime());
    }

    public static Date tomorrow()
    {
        return daysLater(1, today().getTime());
    }

    public String displayFriendly(long time)
    {
        return displayFriendly(time, 2);
    }

    public String displayFriendly(Date date)
    {
        return displayFriendly(date, 2);
    }

    public String displayFriendly(long time, int limit)
    {
        return displayFriendly(new Date(time), limit);
    }

    public String displayFriendly(Date date, int limit)
    {
        return date.toString();
    }

    public static Date parseDate(String value)
    {
        Date date = null;
        if(value != null)
        {
            SimpleDateFormat sdf = new SimpleDateFormat((new DateValidator()).getPattern());
            try
            {
                date = sdf.parse(value);
            }
            catch(ParseException e)
            {
                log.info((new StringBuilder()).append("Unable to parse user profile date: ").append(value).append(". Date will not be indexed.").toString());
            }
        }
        return date;
    }
}
