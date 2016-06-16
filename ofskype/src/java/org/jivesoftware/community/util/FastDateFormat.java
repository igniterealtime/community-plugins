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

import java.io.Serializable;
import java.text.*;
import java.util.*;

public class FastDateFormat
{
    public static final Object FULL = new Integer(0);
    public static final Object LONG = new Integer(1);
    public static final Object MEDIUM = new Integer(2);
    public static final Object SHORT = new Integer(3);

    private static final double LOG_10 = Math.log(10D);

    private static String cDefaultPattern;
    private static TimeZone cDefaultTimeZone = TimeZone.getDefault();
    private static Map cTimeZoneDisplayCache = new HashMap();
    private static Map cInstanceCache = new HashMap(7);
    private static Map cDateInstanceCache = new HashMap(7);
    private static Map cTimeInstanceCache = new HashMap(7);
    private static Map cDateTimeInstanceCache = new HashMap(7);

    private final String mPattern;
    private final TimeZone mTimeZone;
    private final Locale mLocale;
    private final Rule mRules[];
    private final int mMaxLengthEstimate;

    private static class Pair implements Comparable, Serializable
    {
        public int compareTo(Object obj)
        {
            if(this == obj)
                return 0;
            Pair other = (Pair)obj;
            Object a = mObj1;
            Object b = other.mObj1;
            if(a == null)
            {
                if(b != null)
                    return 1;
            } else
            {
                if(b == null)
                    return -1;
                int result = ((Comparable)a).compareTo(b);
                if(result != 0)
                    return result;
            }
            a = mObj2;
            b = other.mObj2;
            if(a == null)
                return b == null ? 0 : 1;
            if(b == null)
                return -1;
            else
                return ((Comparable)a).compareTo(b);
        }

        public boolean equals(Object obj)
        {
            if(this == obj)
                return true;
            if(!(obj instanceof Pair))
            {
                return false;
            } else
            {
                Pair key = (Pair)obj;
                return (mObj1 != null ? mObj1.equals(key.mObj1) : key.mObj1 == null) && (mObj2 != null ? mObj2.equals(key.mObj2) : key.mObj2 == null);
            }
        }

        public int hashCode()
        {
            return (mObj1 != null ? mObj1.hashCode() : 0) + (mObj2 != null ? mObj2.hashCode() : 0);
        }

        public String toString()
        {
            return (new StringBuilder()).append("[").append(mObj1).append(':').append(mObj2).append(']').toString();
        }

        private final Object mObj1;
        private final Object mObj2;

        public Pair(Object obj1, Object obj2)
        {
            mObj1 = obj1;
            mObj2 = obj2;
        }
    }

    private static class TimeZoneDisplayKey
    {

        public int hashCode()
        {
            return mStyle * 31 + mLocale.hashCode();
        }

        public boolean equals(Object obj)
        {
            if(this == obj)
                return true;
            if(obj instanceof TimeZoneDisplayKey)
            {
                TimeZoneDisplayKey other = (TimeZoneDisplayKey)obj;
                return mTimeZone.equals(other.mTimeZone) && mStyle == other.mStyle && mLocale.equals(other.mLocale);
            } else
            {
                return false;
            }
        }

        private final TimeZone mTimeZone;
        private final int mStyle;
        private final Locale mLocale;

        TimeZoneDisplayKey(TimeZone timeZone, boolean daylight, int style, Locale locale)
        {
            mTimeZone = timeZone;
            if(daylight)
                style |= 0x80000000;
            mStyle = style;
            mLocale = locale;
        }
    }

    private static class TimeZoneRule
        implements Rule
    {

        public int estimateLength()
        {
            if(mTimeZone != null)
                return Math.max(mStandard.length(), mDaylight.length());
            return mStyle != 0 ? 40 : 4;
        }

        public void appendTo(StringBuffer buffer, Calendar calendar)
        {
            TimeZone timeZone;
            if((timeZone = mTimeZone) != null)
            {
                if(timeZone.useDaylightTime() && calendar.get(16) != 0)
                    buffer.append(mDaylight);
                else
                    buffer.append(mStandard);
            } else
            {
                timeZone = calendar.getTimeZone();
                if(timeZone.useDaylightTime() && calendar.get(16) != 0)
                    buffer.append(FastDateFormat.getTimeZoneDisplay(timeZone, true, mStyle, mLocale));
                else
                    buffer.append(FastDateFormat.getTimeZoneDisplay(timeZone, false, mStyle, mLocale));
            }
        }

        private final TimeZone mTimeZone;
        private final Locale mLocale;
        private final int mStyle;
        private final String mStandard;
        private final String mDaylight;

        TimeZoneRule(TimeZone timeZone, Locale locale, int style)
        {
            mTimeZone = timeZone;
            mLocale = locale;
            mStyle = style;
            if(timeZone != null)
            {
                mStandard = FastDateFormat.getTimeZoneDisplay(timeZone, false, style, locale);
                mDaylight = FastDateFormat.getTimeZoneDisplay(timeZone, true, style, locale);
            } else
            {
                mStandard = null;
                mDaylight = null;
            }
        }
    }

    private static class TwentyFourHourField
        implements NumberRule
    {

        public int estimateLength()
        {
            return mRule.estimateLength();
        }

        public void appendTo(StringBuffer buffer, Calendar calendar)
        {
            int value = calendar.get(11);
            if(value == 0)
                value = calendar.getMaximum(11) + 1;
            mRule.appendTo(buffer, value);
        }

        public void appendTo(StringBuffer buffer, int value)
        {
            mRule.appendTo(buffer, value);
        }

        private final NumberRule mRule;

        TwentyFourHourField(NumberRule rule)
        {
            mRule = rule;
        }
    }

    private static class TwelveHourField
        implements NumberRule
    {

        public int estimateLength()
        {
            return mRule.estimateLength();
        }

        public void appendTo(StringBuffer buffer, Calendar calendar)
        {
            int value = calendar.get(10);
            if(value == 0)
                value = calendar.getLeastMaximum(10) + 1;
            mRule.appendTo(buffer, value);
        }

        public void appendTo(StringBuffer buffer, int value)
        {
            mRule.appendTo(buffer, value);
        }

        private final NumberRule mRule;

        TwelveHourField(NumberRule rule)
        {
            mRule = rule;
        }
    }

    private static class TwoDigitMonthField
        implements NumberRule
    {

        public int estimateLength()
        {
            return 2;
        }

        public void appendTo(StringBuffer buffer, Calendar calendar)
        {
            appendTo(buffer, calendar.get(2) + 1);
        }

        public final void appendTo(StringBuffer buffer, int value)
        {
            buffer.append((char)(value / 10 + 48));
            buffer.append((char)(value % 10 + 48));
        }

        TwoDigitMonthField()
        {
        }
    }

    private static class TwoDigitYearField
        implements NumberRule
    {

        public int estimateLength()
        {
            return 2;
        }

        public void appendTo(StringBuffer buffer, Calendar calendar)
        {
            appendTo(buffer, calendar.get(1) % 100);
        }

        public final void appendTo(StringBuffer buffer, int value)
        {
            buffer.append((char)(value / 10 + 48));
            buffer.append((char)(value % 10 + 48));
        }

        TwoDigitYearField()
        {
        }
    }

    private static class TwoDigitNumberField
        implements NumberRule
    {

        public int estimateLength()
        {
            return 2;
        }

        public void appendTo(StringBuffer buffer, Calendar calendar)
        {
            appendTo(buffer, calendar.get(mField));
        }

        public final void appendTo(StringBuffer buffer, int value)
        {
            if(value < 100)
            {
                buffer.append((char)(value / 10 + 48));
                buffer.append((char)(value % 10 + 48));
            } else
            {
                buffer.append(Integer.toString(value));
            }
        }

        private final int mField;

        TwoDigitNumberField(int field)
        {
            mField = field;
        }
    }

    private static class PaddedNumberField
        implements NumberRule
    {

        public int estimateLength()
        {
            return 4;
        }

        public void appendTo(StringBuffer buffer, Calendar calendar)
        {
            appendTo(buffer, calendar.get(mField));
        }

        public final void appendTo(StringBuffer buffer, int value)
        {
            if(value < 100)
            {
                for(int i = mSize; --i >= 2;)
                    buffer.append('0');

                buffer.append((char)(value / 10 + 48));
                buffer.append((char)(value % 10 + 48));
            } else
            {
                int digits;
                if(value < 1000)
                    digits = 3;
                else
                    digits = (int)(Math.log(value) / FastDateFormat.LOG_10) + 1;
                for(int i = mSize; --i >= digits;)
                    buffer.append('0');

                buffer.append(Integer.toString(value));
            }
        }

        private final int mField;
        private final int mSize;

        PaddedNumberField(int field, int size)
        {
            if(size < 3)
            {
                throw new IllegalArgumentException();
            } else
            {
                mField = field;
                mSize = size;
                return;
            }
        }
    }

    private static class UnpaddedMonthField
        implements NumberRule
    {

        public int estimateLength()
        {
            return 2;
        }

        public void appendTo(StringBuffer buffer, Calendar calendar)
        {
            appendTo(buffer, calendar.get(2) + 1);
        }

        public final void appendTo(StringBuffer buffer, int value)
        {
            if(value < 10)
            {
                buffer.append((char)(value + 48));
            } else
            {
                buffer.append((char)(value / 10 + 48));
                buffer.append((char)(value % 10 + 48));
            }
        }

        UnpaddedMonthField()
        {
        }
    }

    private static class UnpaddedNumberField
        implements NumberRule
    {

        public int estimateLength()
        {
            return 4;
        }

        public void appendTo(StringBuffer buffer, Calendar calendar)
        {
            appendTo(buffer, calendar.get(mField));
        }

        public final void appendTo(StringBuffer buffer, int value)
        {
            if(value < 10)
                buffer.append((char)(value + 48));
            else
            if(value < 100)
            {
                buffer.append((char)(value / 10 + 48));
                buffer.append((char)(value % 10 + 48));
            } else
            {
                buffer.append(Integer.toString(value));
            }
        }

        private final int mField;

        UnpaddedNumberField(int field)
        {
            mField = field;
        }
    }

    private static class TextField
        implements Rule
    {

        public int estimateLength()
        {
            int max = 0;
            int i = mValues.length;
            do
            {
                if(--i < 0)
                    break;
                int len = mValues[i].length();
                if(len > max)
                    max = len;
            } while(true);
            return max;
        }

        public void appendTo(StringBuffer buffer, Calendar calendar)
        {
            buffer.append(mValues[calendar.get(mField)]);
        }

        private final int mField;
        private final String mValues[];

        TextField(int field, String values[])
        {
            mField = field;
            mValues = values;
        }
    }

    private static class StringLiteral
        implements Rule
    {

        public int estimateLength()
        {
            return mValue.length();
        }

        public void appendTo(StringBuffer buffer, Calendar calendar)
        {
            buffer.append(mValue);
        }

        private final String mValue;

        StringLiteral(String value)
        {
            mValue = value;
        }
    }

    private static class CharacterLiteral
        implements Rule
    {

        public int estimateLength()
        {
            return 1;
        }

        public void appendTo(StringBuffer buffer, Calendar calendar)
        {
            buffer.append(mValue);
        }

        private final char mValue;

        CharacterLiteral(char value)
        {
            mValue = value;
        }
    }

    private static interface NumberRule
        extends Rule
    {

        public abstract void appendTo(StringBuffer stringbuffer, int i);
    }

    private static interface Rule
    {

        public abstract int estimateLength();

        public abstract void appendTo(StringBuffer stringbuffer, Calendar calendar);
    }


    public static FastDateFormat getInstance()
    {
        return getInstance(getDefaultPattern(), null, null, null);
    }

    public static FastDateFormat getInstance(String pattern)
        throws IllegalArgumentException
    {
        return getInstance(pattern, null, null, null);
    }

    public static FastDateFormat getInstance(String pattern, TimeZone timeZone)
        throws IllegalArgumentException
    {
        return getInstance(pattern, timeZone, null, null);
    }

    public static FastDateFormat getInstance(String pattern, Locale locale)
        throws IllegalArgumentException
    {
        return getInstance(pattern, null, locale, null);
    }

    public static FastDateFormat getInstance(String pattern, DateFormatSymbols symbols)
        throws IllegalArgumentException
    {
        return getInstance(pattern, null, null, symbols);
    }

    public static FastDateFormat getInstance(String pattern, TimeZone timeZone, Locale locale)
        throws IllegalArgumentException
    {
        return getInstance(pattern, timeZone, locale, null);
    }

    public static synchronized FastDateFormat getInstance(String pattern, TimeZone timeZone, Locale locale, DateFormatSymbols symbols)
        throws IllegalArgumentException
    {
        Object key = pattern;
        if(timeZone != null)
            key = new Pair(key, timeZone);
        if(locale != null)
            key = new Pair(key, locale);
        if(symbols != null)
            key = new Pair(key, symbols);
        FastDateFormat format = (FastDateFormat)cInstanceCache.get(key);
        if(format == null)
        {
            if(locale == null)
                locale = Locale.getDefault();
            if(symbols == null)
                symbols = new DateFormatSymbols(locale);
            format = new FastDateFormat(pattern, timeZone, locale, symbols);
            cInstanceCache.put(key, format);
        }
        return format;
    }

    public static synchronized FastDateFormat getDateInstance(Object style, TimeZone timeZone, Locale locale)
        throws IllegalArgumentException
    {
        Object key = style;
        if(timeZone != null)
            key = new Pair(key, timeZone);
        if(locale == null)
            key = new Pair(key, locale);
        FastDateFormat format = (FastDateFormat)cDateInstanceCache.get(key);
        if(format == null)
        {
            int ds;
            try
            {
                ds = ((Integer)style).intValue();
            }
            catch(ClassCastException e)
            {
                throw new IllegalArgumentException((new StringBuilder()).append("Illegal date style: ").append(style).toString());
            }
            if(locale == null)
                locale = Locale.getDefault();
            try
            {
                String pattern = ((SimpleDateFormat)DateFormat.getDateInstance(ds, locale)).toPattern();
                format = getInstance(pattern, timeZone, locale);
                cDateInstanceCache.put(key, format);
            }
            catch(ClassCastException e)
            {
                throw new IllegalArgumentException((new StringBuilder()).append("No date pattern for locale: ").append(locale).toString());
            }
        }
        return format;
    }

    public static synchronized FastDateFormat getTimeInstance(Object style, TimeZone timeZone, Locale locale)
        throws IllegalArgumentException
    {
        Object key = style;
        if(timeZone != null)
            key = new Pair(key, timeZone);
        if(locale != null)
            key = new Pair(key, locale);
        FastDateFormat format = (FastDateFormat)cTimeInstanceCache.get(key);
        if(format == null)
        {
            int ts;
            try
            {
                ts = ((Integer)style).intValue();
            }
            catch(ClassCastException e)
            {
                throw new IllegalArgumentException((new StringBuilder()).append("Illegal time style: ").append(style).toString());
            }
            if(locale == null)
                locale = Locale.getDefault();
            try
            {
                String pattern = ((SimpleDateFormat)DateFormat.getTimeInstance(ts, locale)).toPattern();
                format = getInstance(pattern, timeZone, locale);
                cTimeInstanceCache.put(key, format);
            }
            catch(ClassCastException e)
            {
                throw new IllegalArgumentException((new StringBuilder()).append("No date pattern for locale: ").append(locale).toString());
            }
        }
        return format;
    }

    public static synchronized FastDateFormat getDateTimeInstance(Object dateStyle, Object timeStyle, TimeZone timeZone, Locale locale)
        throws IllegalArgumentException
    {
        Object key = new Pair(dateStyle, timeStyle);
        if(timeZone != null)
            key = new Pair(key, timeZone);
        if(locale != null)
            key = new Pair(key, locale);
        FastDateFormat format = (FastDateFormat)cDateTimeInstanceCache.get(key);
        if(format == null)
        {
            int ds;
            try
            {
                ds = ((Integer)dateStyle).intValue();
            }
            catch(ClassCastException e)
            {
                throw new IllegalArgumentException((new StringBuilder()).append("Illegal date style: ").append(dateStyle).toString());
            }
            int ts;
            try
            {
                ts = ((Integer)timeStyle).intValue();
            }
            catch(ClassCastException e)
            {
                throw new IllegalArgumentException((new StringBuilder()).append("Illegal time style: ").append(timeStyle).toString());
            }
            if(locale == null)
                locale = Locale.getDefault();
            try
            {
                String pattern = ((SimpleDateFormat)DateFormat.getDateTimeInstance(ds, ts, locale)).toPattern();
                format = getInstance(pattern, timeZone, locale);
                cDateTimeInstanceCache.put(key, format);
            }
            catch(ClassCastException e)
            {
                throw new IllegalArgumentException((new StringBuilder()).append("No date time pattern for locale: ").append(locale).toString());
            }
        }
        return format;
    }

    static synchronized String getTimeZoneDisplay(TimeZone tz, boolean daylight, int style, Locale locale)
    {
        Object key = new TimeZoneDisplayKey(tz, daylight, style, locale);
        String value = (String)cTimeZoneDisplayCache.get(key);
        if(value == null)
        {
            value = tz.getDisplayName(daylight, style, locale);
            cTimeZoneDisplayCache.put(key, value);
        }
        return value;
    }

    private static synchronized String getDefaultPattern()
    {
        if(cDefaultPattern == null)
            cDefaultPattern = (new SimpleDateFormat()).toPattern();
        return cDefaultPattern;
    }

    private static List parse(String pattern, TimeZone timeZone, Locale locale, DateFormatSymbols symbols)
    {
        List rules = new ArrayList();
        String ERAs[] = symbols.getEras();
        String months[] = symbols.getMonths();
        String shortMonths[] = symbols.getShortMonths();
        String weekdays[] = symbols.getWeekdays();
        String shortWeekdays[] = symbols.getShortWeekdays();
        String AmPmStrings[] = symbols.getAmPmStrings();
        int length = pattern.length();
        int indexRef[] = new int[1];
        int i = 0;
        do
        {
            if(i >= length)
                break;
            indexRef[0] = i;
            String token = parseToken(pattern, indexRef);
            i = indexRef[0];
            int tokenLen = token.length();
            if(tokenLen == 0)
                break;
            char c = token.charAt(0);
            Rule rule;
            switch(c)
            {
            case 71: // 'G'
                rule = new TextField(0, ERAs);
                break;

            case 121: // 'y'
                if(tokenLen >= 4)
                    rule = new UnpaddedNumberField(1);
                else
                    rule = new TwoDigitYearField();
                break;

            case 77: // 'M'
                if(tokenLen >= 4)
                {
                    rule = new TextField(2, months);
                    break;
                }
                if(tokenLen == 3)
                {
                    rule = new TextField(2, shortMonths);
                    break;
                }
                if(tokenLen == 2)
                    rule = new TwoDigitMonthField();
                else
                    rule = new UnpaddedMonthField();
                break;

            case 100: // 'd'
                rule = selectNumberRule(5, tokenLen);
                break;

            case 104: // 'h'
                rule = new TwelveHourField(selectNumberRule(10, tokenLen));
                break;

            case 72: // 'H'
                rule = selectNumberRule(11, tokenLen);
                break;

            case 109: // 'm'
                rule = selectNumberRule(12, tokenLen);
                break;

            case 115: // 's'
                rule = selectNumberRule(13, tokenLen);
                break;

            case 83: // 'S'
                rule = selectNumberRule(14, tokenLen);
                break;

            case 69: // 'E'
                rule = new TextField(7, tokenLen >= 4 ? weekdays : shortWeekdays);
                break;

            case 68: // 'D'
                rule = selectNumberRule(6, tokenLen);
                break;

            case 70: // 'F'
                rule = selectNumberRule(8, tokenLen);
                break;

            case 119: // 'w'
                rule = selectNumberRule(3, tokenLen);
                break;

            case 87: // 'W'
                rule = selectNumberRule(4, tokenLen);
                break;

            case 97: // 'a'
                rule = new TextField(9, AmPmStrings);
                break;

            case 107: // 'k'
                rule = new TwentyFourHourField(selectNumberRule(11, tokenLen));
                break;

            case 75: // 'K'
                rule = selectNumberRule(10, tokenLen);
                break;

            case 122: // 'z'
                if(tokenLen >= 4)
                    rule = new TimeZoneRule(timeZone, locale, 1);
                else
                    rule = new TimeZoneRule(timeZone, locale, 0);
                break;

            case 39: // '\''
                String sub = token.substring(1);
                if(sub.length() == 1)
                    rule = new CharacterLiteral(sub.charAt(0));
                else
                    rule = new StringLiteral(new String(sub));
                break;

            case 40: // '('
            case 41: // ')'
            case 42: // '*'
            case 43: // '+'
            case 44: // ','
            case 45: // '-'
            case 46: // '.'
            case 47: // '/'
            case 48: // '0'
            case 49: // '1'
            case 50: // '2'
            case 51: // '3'
            case 52: // '4'
            case 53: // '5'
            case 54: // '6'
            case 55: // '7'
            case 56: // '8'
            case 57: // '9'
            case 58: // ':'
            case 59: // ';'
            case 60: // '<'
            case 61: // '='
            case 62: // '>'
            case 63: // '?'
            case 64: // '@'
            case 65: // 'A'
            case 66: // 'B'
            case 67: // 'C'
            case 73: // 'I'
            case 74: // 'J'
            case 76: // 'L'
            case 78: // 'N'
            case 79: // 'O'
            case 80: // 'P'
            case 81: // 'Q'
            case 82: // 'R'
            case 84: // 'T'
            case 85: // 'U'
            case 86: // 'V'
            case 88: // 'X'
            case 89: // 'Y'
            case 90: // 'Z'
            case 91: // '['
            case 92: // '\\'
            case 93: // ']'
            case 94: // '^'
            case 95: // '_'
            case 96: // '`'
            case 98: // 'b'
            case 99: // 'c'
            case 101: // 'e'
            case 102: // 'f'
            case 103: // 'g'
            case 105: // 'i'
            case 106: // 'j'
            case 108: // 'l'
            case 110: // 'n'
            case 111: // 'o'
            case 112: // 'p'
            case 113: // 'q'
            case 114: // 'r'
            case 116: // 't'
            case 117: // 'u'
            case 118: // 'v'
            case 120: // 'x'
            default:
                throw new IllegalArgumentException((new StringBuilder()).append("Illegal pattern component: ").append(token).toString());
            }
            rules.add(rule);
            i++;
        } while(true);
        return rules;
    }

    private static String parseToken(String pattern, int indexRef[])
    {
        StringBuffer buf = new StringBuffer();
        int i = indexRef[0];
        int length = pattern.length();
        char c = pattern.charAt(i);
        if(c >= 'A' && c <= 'Z' || c >= 'a' && c <= 'z')
        {
            buf.append(c);
            do
            {
                if(i + 1 >= length)
                    break;
                char peek = pattern.charAt(i + 1);
                if(peek != c)
                    break;
                buf.append(c);
                i++;
            } while(true);
        } else
        {
            buf.append('\'');
            boolean inLiteral = false;
            for(; i < length; i++)
            {
                c = pattern.charAt(i);
                if(c == '\'')
                {
                    if(i + 1 < length && pattern.charAt(i + 1) == '\'')
                    {
                        i++;
                        buf.append(c);
                    } else
                    {
                        inLiteral = !inLiteral;
                    }
                    continue;
                }
                if(!inLiteral && (c >= 'A' && c <= 'Z' || c >= 'a' && c <= 'z'))
                {
                    i--;
                    break;
                }
                buf.append(c);
            }

        }
        indexRef[0] = i;
        return buf.toString();
    }

    private static NumberRule selectNumberRule(int field, int padding)
    {
        switch(padding)
        {
        case 1: // '\001'
            return new UnpaddedNumberField(field);

        case 2: // '\002'
            return new TwoDigitNumberField(field);
        }
        return new PaddedNumberField(field, padding);
    }

    private FastDateFormat()
    {
        this(getDefaultPattern(), null, null, null);
    }

    private FastDateFormat(String pattern)
        throws IllegalArgumentException
    {
        this(pattern, null, null, null);
    }

    private FastDateFormat(String pattern, TimeZone timeZone)
        throws IllegalArgumentException
    {
        this(pattern, timeZone, null, null);
    }

    private FastDateFormat(String pattern, Locale locale)
        throws IllegalArgumentException
    {
        this(pattern, null, locale, null);
    }

    private FastDateFormat(String pattern, DateFormatSymbols symbols)
        throws IllegalArgumentException
    {
        this(pattern, null, null, symbols);
    }

    private FastDateFormat(String pattern, TimeZone timeZone, Locale locale)
        throws IllegalArgumentException
    {
        this(pattern, timeZone, locale, null);
    }

    private FastDateFormat(String pattern, TimeZone timeZone, Locale locale, DateFormatSymbols symbols)
        throws IllegalArgumentException
    {
        if(locale == null)
            locale = Locale.getDefault();
        mPattern = pattern;
        mTimeZone = timeZone;
        mLocale = locale;
        if(symbols == null)
            symbols = new DateFormatSymbols(locale);
        List rulesList = parse(pattern, timeZone, locale, symbols);
        mRules = (Rule[])(Rule[])rulesList.toArray(new Rule[rulesList.size()]);
        int len = 0;
        for(int i = mRules.length; --i >= 0;)
            len += mRules[i].estimateLength();

        mMaxLengthEstimate = len;
    }

    public String format(Date date)
    {
        Calendar c = new GregorianCalendar(cDefaultTimeZone);
        c.setTime(date);
        if(mTimeZone != null)
            c.setTimeZone(mTimeZone);
        return applyRules(c, new StringBuffer(mMaxLengthEstimate)).toString();
    }

    public String format(Calendar calendar)
    {
        return format(calendar, new StringBuffer(mMaxLengthEstimate)).toString();
    }

    public StringBuffer format(Date date, StringBuffer buf)
    {
        Calendar c = new GregorianCalendar(cDefaultTimeZone);
        c.setTime(date);
        if(mTimeZone != null)
            c.setTimeZone(mTimeZone);
        return applyRules(c, buf);
    }

    public StringBuffer format(Calendar calendar, StringBuffer buf)
    {
        if(mTimeZone != null)
        {
            calendar = (Calendar)calendar.clone();
            calendar.setTimeZone(mTimeZone);
        }
        return applyRules(calendar, buf);
    }

    private StringBuffer applyRules(Calendar calendar, StringBuffer buf)
    {
        Rule rules[] = mRules;
        int len = mRules.length;
        for(int i = 0; i < len; i++)
            rules[i].appendTo(buf, calendar);

        return buf;
    }

    public String getPattern()
    {
        return mPattern;
    }

    public TimeZone getTimeZone()
    {
        return mTimeZone;
    }

    public Locale getLocale()
    {
        return mLocale;
    }

    public int getMaxLengthEstimate()
    {
        return mMaxLengthEstimate;
    }
}
