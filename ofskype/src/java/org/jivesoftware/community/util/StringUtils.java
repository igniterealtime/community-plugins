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

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.ByteArrayInputStream;
import java.io.InputStream;
import java.io.UnsupportedEncodingException;
import java.net.URLDecoder;
import java.net.URLEncoder;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.text.BreakIterator;
import java.text.DateFormat;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.BitSet;
import java.util.Collection;
import java.util.Date;
import java.util.HashMap;
import java.util.Iterator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.StringTokenizer;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import org.apache.commons.codec.DecoderException;
import org.apache.commons.codec.EncoderException;
import org.apache.commons.codec.binary.Hex;
import org.apache.commons.codec.net.QuotedPrintableCodec;

import org.jivesoftware.util.*;


public class StringUtils extends org.apache.commons.lang.StringUtils
{
    private static final Logger Log = LoggerFactory.getLogger(StringUtils.class);

    private static final char QUOTE_ENCODE[] = "&quot;".toCharArray();
    private static final char AMP_ENCODE[] = "&amp;".toCharArray();
    private static final char LT_ENCODE[] = "&lt;".toCharArray();
    private static final char GT_ENCODE[] = "&gt;".toCharArray();
    private static final char APOS_ENCODE[] = "&apos;".toCharArray();
    private static Pattern basicAddressPattern;
    private static Pattern validUserPattern;
    private static Pattern domainPattern;
    private static Pattern ipDomainPattern;
    private static Pattern tldPattern;
    private static final String EMAIL_DOMAINS = "com|net|org|edu|int|mil|gov|arpa|biz|aero|name|coop|info|pro|museum|mobi";
    private static final Pattern WHITESPACE = Pattern.compile("(\\s|&nbsp;)*");
    private static final Pattern URL_SAFE = Pattern.compile("([^0-9A-Za-z\\-\\_]+)");
    private static final char HEX_ENC_CHARS[] = "abcdefABCDEF012345678".toCharArray();
    private static MessageDigest digest = null;
    private static final char base[];
    private static final int indexes[];
    private static final char CA[];
    private static final int IA[];
    private static final BitSet allowed_query;
    private static SecureRandom randGen = new SecureRandom();
    private static char numbersAndLetters[] = "0123456789abcdefghijklmnopqrstuvwxyz0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ".toCharArray();
    private static final char zeroArray[] = "0000000000000000000000000000000000000000000000000000000000000000".toCharArray();
    public static final String OTHER_SAFE_CHARACTERS = "!'\",.?*@`~-+_=/\\:$";
    private static char WS_ARRAY[];
    private static Map HTML_ENTITY_MAP;
    private static final String PLAIN_ASCII = "AaEeIiOoUuAaEeIiOoUuYyAaEeIiOoUuYyAaOoAaEeIiOoUuYyAaCc";
    private static final String UNICODE = "\300\340\310\350\314\354\322\362\331\371\301\341\311\351\315\355\323\363\332\372\335\375\302\342\312\352\316\356\324\364\333\373\u0176\u0177\303\343\325\365\304\344\313\353\317\357\326\366\334\374\u0178\377\305\345\307\347";

    public static String getValidEmailDomains()
    {
        return "com|net|org|edu|int|mil|gov|arpa|biz|aero|name|coop|info|pro|museum|mobi";
    }

    private StringUtils()
    {
    }

    public static String replace(String string, String oldString, String newString)
    {
        if(string == null)
            return null;
        if(newString == null)
            return string;
        int i = 0;
        if((i = string.indexOf(oldString, i)) >= 0)
        {
            char string2[] = string.toCharArray();
            char newString2[] = newString.toCharArray();
            int oLength = oldString.length();
            StringBuffer buf = new StringBuffer(string2.length);
            buf.append(string2, 0, i).append(newString2);
            i += oLength;
            int j;
            for(j = i; (i = string.indexOf(oldString, i)) > 0; j = i)
            {
                buf.append(string2, j, i - j).append(newString2);
                i += oLength;
            }

            buf.append(string2, j, string2.length - j);
            return buf.toString();
        } else
        {
            return string;
        }
    }

    public static String replaceIgnoreCase(String line, String oldString, String newString)
    {
        if(line == null)
            return null;
        String lcLine = line.toLowerCase();
        String lcOldString = oldString.toLowerCase();
        int i = 0;
        if((i = lcLine.indexOf(lcOldString, i)) >= 0)
        {
            char line2[] = line.toCharArray();
            char newString2[] = newString.toCharArray();
            int oLength = oldString.length();
            StringBuffer buf = new StringBuffer(line2.length);
            buf.append(line2, 0, i).append(newString2);
            i += oLength;
            int j;
            for(j = i; (i = lcLine.indexOf(lcOldString, i)) > 0; j = i)
            {
                buf.append(line2, j, i - j).append(newString2);
                i += oLength;
            }

            buf.append(line2, j, line2.length - j);
            return buf.toString();
        } else
        {
            return line;
        }
    }

    public static String replaceIgnoreCase(String line, String oldString, String newString, int count[])
    {
        if(line == null)
            return null;
        String lcLine = line.toLowerCase();
        String lcOldString = oldString.toLowerCase();
        int i = 0;
        if((i = lcLine.indexOf(lcOldString, i)) >= 0)
        {
            int counter = 1;
            char line2[] = line.toCharArray();
            char newString2[] = newString.toCharArray();
            int oLength = oldString.length();
            StringBuffer buf = new StringBuffer(line2.length);
            buf.append(line2, 0, i).append(newString2);
            i += oLength;
            int j;
            for(j = i; (i = lcLine.indexOf(lcOldString, i)) > 0; j = i)
            {
                counter++;
                buf.append(line2, j, i - j).append(newString2);
                i += oLength;
            }

            buf.append(line2, j, line2.length - j);
            count[0] = counter;
            return buf.toString();
        } else
        {
            return line;
        }
    }

    public static String replace(String line, String oldString, String newString, int count[])
    {
        if(line == null)
            return null;
        int i = 0;
        if((i = line.indexOf(oldString, i)) >= 0)
        {
            int counter = 1;
            char line2[] = line.toCharArray();
            char newString2[] = newString.toCharArray();
            int oLength = oldString.length();
            StringBuffer buf = new StringBuffer(line2.length);
            buf.append(line2, 0, i).append(newString2);
            i += oLength;
            int j;
            for(j = i; (i = line.indexOf(oldString, i)) > 0; j = i)
            {
                counter++;
                buf.append(line2, j, i - j).append(newString2);
                i += oLength;
            }

            buf.append(line2, j, line2.length - j);
            count[0] = counter;
            return buf.toString();
        } else
        {
            return line;
        }
    }

    public static String stripTags(String in)
    {
        if(in == null)
            return null;
        else
            return stripTags(in, false);
    }

    public static String stripTags(String in, boolean stripBRTag)
    {
        if(in == null)
            return null;
        int i = 0;
        int last = 0;
        char input[] = in.toCharArray();
        int len = input.length;
        StringBuffer out = new StringBuffer((int)((double)len * 1.3D));
        for(; i < len; i++)
        {
            char ch = input[i];
            if(ch > '>')
                continue;
            if(ch == '<')
            {
                if(!stripBRTag && i + 3 < len && input[i + 1] == 'b' && input[i + 2] == 'r' && input[i + 3] == '>')
                {
                    i += 3;
                    continue;
                }
                if(i > last)
                {
                    if(last > 0)
                        out.append(" ");
                    out.append(input, last, i - last);
                }
                last = i + 1;
                continue;
            }
            if(ch == '>')
                last = i + 1;
        }

        if(last == 0)
            return in;
        if(i > last)
            out.append(input, last, i - last);
        return out.toString();
    }

    public static String escapeHTMLTags(String in)
    {
        if(in == null)
            return null;
        int i = 0;
        int last = 0;
        char input[] = in.toCharArray();
        int len = input.length;
        StringBuffer out = new StringBuffer((int)((double)len * 1.3D));
        for(; i < len; i++)
        {
            char ch = input[i];
            if(ch > '>')
                continue;
            if(ch == '<')
            {
                if(i > last)
                    out.append(input, last, i - last);
                last = i + 1;
                out.append(LT_ENCODE);
                continue;
            }
            if(ch == '>')
            {
                if(i > last)
                    out.append(input, last, i - last);
                last = i + 1;
                out.append(GT_ENCODE);
                continue;
            }
            if(ch == '"')
            {
                if(i > last)
                    out.append(input, last, i - last);
                last = i + 1;
                out.append(QUOTE_ENCODE);
                continue;
            }
            if(ch != '&')
                continue;
            if(i > last)
                out.append(input, last, i - last);
            last = i + 1;
            out.append(AMP_ENCODE);
        }

        if(last == 0)
            return in;
        if(i > last)
            out.append(input, last, i - last);
        return out.toString();
    }

    public static synchronized String hash(String data)
    {
        if(digest == null)
            try
            {
                digest = MessageDigest.getInstance("MD5");
            }
            catch(NoSuchAlgorithmException nsae)
            {
                Log.error("Failed to load the MD5 MessageDigest. Jive will be unable to function normally.", nsae);
            }
        try
        {
            digest.update(data.getBytes("utf-8"));
        }
        catch(UnsupportedEncodingException e)
        {
            Log.error(e.toString());
            throw new UnsupportedOperationException((new StringBuilder()).append("Error computing hash: ").append(e.getMessage()).toString());
        }
        return encodeHex(digest.digest());
    }

    public static synchronized String hash(char data[])
    {
        return hash(new String(data));
    }

    public static String encodeHex(byte bytes[])
    {
        return new String(Hex.encodeHex(bytes));
    }

    public static byte[] decodeHex(String hex)
    {
        if(hex == null)
            return null;
        try
        {
            return Hex.decodeHex(hex.toCharArray());
        }
        catch(DecoderException e)
        {
            Log.error(e.toString());
        }
        return null;
    }

    public static String encodeBase64(String data)
    {
        byte bytes[] = null;
        try
        {
            bytes = data.getBytes("UTF-8");
        }
        catch(UnsupportedEncodingException uee)
        {
            Log.error(uee.toString());
        }
        return encodeBase64(bytes);
    }

    public static String decodeBase64(String data)
    {
        try
        {
			byte decoded[];
			byte bytes[] = data.getBytes("UTF-8");
			decoded = decodeBase64(bytes);

			if(decoded == null)
				return "";

            return new String(decoded, "UTF-8");
        }
        catch(Exception uee)
        {
            Log.error(uee.toString());
        }
        return "";
    }

    public static String encodeAlphaNumeric(long toEncode)
    {
        if(toEncode < 0L)
            throw new UnsupportedOperationException("Encoding of negative numbers is not supported");
        if(toEncode == 0L)
            return "0";
        StringBuffer buff = new StringBuffer();
        for(; toEncode != 0L; toEncode /= base.length)
            buff.append(base[(int)(toEncode % (long)base.length)]);

        return buff.reverse().toString();
    }

    public static long decodeAlphaNumeric(String encoded)
    {
        if(encoded.equals("0"))
            return 0L;
        StringBuffer buff = (new StringBuffer(encoded)).reverse();
        long result = 0L;
        for(int i = 0; i < buff.length(); i++)
        {
            char current = buff.charAt(i);
            long currentVal = indexes[current];
            result += currentVal * (long)Math.pow(base.length, i);
        }

        if(result < 0L)
            throw new IllegalArgumentException((new StringBuilder()).append("Input string ").append(encoded).append(" did not decode to a positive long value.").toString());
        else
            return result;
    }

    public static String encodeBase64(byte data[])
    {
        boolean lineSep = false;
        int sLen = data == null ? 0 : data.length;
        if(sLen == 0)
            return "";
        int eLen = (sLen / 3) * 3;
        int cCnt = (sLen - 1) / 3 + 1 << 2;
        int dLen = cCnt + (lineSep ? (cCnt - 1) / 76 << 1 : 0);
        char dArr[] = new char[dLen];
        int s = 0;
        int d = 0;
        int cc = 0;
        do
        {
            if(s >= eLen)
                break;
            int i = (data[s++] & 0xff) << 16 | (data[s++] & 0xff) << 8 | data[s++] & 0xff;
            dArr[d++] = CA[i >>> 18 & 0x3f];
            dArr[d++] = CA[i >>> 12 & 0x3f];
            dArr[d++] = CA[i >>> 6 & 0x3f];
            dArr[d++] = CA[i & 0x3f];
            if(lineSep && ++cc == 19 && d < dLen - 2)
            {
                dArr[d++] = '\r';
                dArr[d++] = '\n';
                cc = 0;
            }
        } while(true);
        int left = sLen - eLen;
        if(left > 0)
        {
            int i = (data[eLen] & 0xff) << 10 | (left != 2 ? 0 : (data[sLen - 1] & 0xff) << 2);
            dArr[dLen - 4] = CA[i >> 12];
            dArr[dLen - 3] = CA[i >>> 6 & 0x3f];
            dArr[dLen - 2] = left != 2 ? '=' : CA[i & 0x3f];
            dArr[dLen - 1] = '=';
        }
        return new String(dArr);
    }

    public static byte[] decodeBase64(byte bytes[])
    {
        int sLen = bytes.length;
        int sepCnt = 0;
        for(int i = 0; i < sLen; i++)
            if(IA[bytes[i] & 0xff] < 0)
                sepCnt++;

        if((sLen - sepCnt) % 4 != 0)
            return null;
        int pad = 0;
        int i = sLen;
        do
        {
            if(i <= 1 || IA[bytes[--i] & 0xff] > 0)
                break;
            if(bytes[i] == 61)
                pad++;
        } while(true);
        int len = ((sLen - sepCnt) * 6 >> 3) - pad;
        byte dArr[] = new byte[len];
        int s = 0;
        int d = 0;
        do
        {
            if(d >= len)
                break;

            i = 0;

            for(int j = 0; j < 4; j++)
            {
                int c = IA[bytes[s++] & 0xff];
                if(c >= 0)
                    i |= c << 18 - j * 6;
                else
                    j--;
            }

            dArr[d++] = (byte)(i >> 16);
            if(d < len)
            {
                dArr[d++] = (byte)(i >> 8);
                if(d < len)
                    dArr[d++] = (byte)i;
            }
        } while(true);
        return dArr;
    }

    public static String URLEncode(String original, String charset)
        throws UnsupportedEncodingException
    {
        if(original == null)
            return null;
        byte octets[];
        try
        {
            octets = original.getBytes(charset);
        }
        catch(UnsupportedEncodingException error)
        {
            throw new UnsupportedEncodingException();
        }
        StringBuffer buf = new StringBuffer(octets.length);
        byte arr$[] = octets;
        int len$ = arr$.length;
        for(int i$ = 0; i$ < len$; i$++)
        {
            byte octet = arr$[i$];
            char c = (char)octet;
            if(allowed_query.get(c))
            {
                buf.append(c);
            } else
            {
                buf.append('%');
                char hexadecimal = Character.forDigit(octet >> 4 & 0xf, 16);
                buf.append(Character.toUpperCase(hexadecimal));
                hexadecimal = Character.forDigit(octet & 0xf, 16);
                buf.append(Character.toUpperCase(hexadecimal));
            }
        }

        return buf.toString();
    }

    public static String URLEncode(String string)
    {
        try
        {
            return URLEncoder.encode(string, "UTF-8");
        }
        catch(UnsupportedEncodingException uee)
        {
            Log.warn("URL encoding failed." + uee);
        }
        return string;
    }

    public static String[] toLowerCaseWordArray(String text)
    {
        if(text == null || text.length() == 0)
            return new String[0];
        ArrayList wordList = new ArrayList();
        BreakIterator boundary = BreakIterator.getWordInstance();
        boundary.setText(text);
        int start = 0;
        for(int end = boundary.next(); end != -1; end = boundary.next())
        {
            String tmp = text.substring(start, end).trim();
            tmp = replace(tmp, "+", "");
            tmp = replace(tmp, "/", "");
            tmp = replace(tmp, "\\", "");
            tmp = replace(tmp, "#", "");
            tmp = replace(tmp, "*", "");
            tmp = replace(tmp, ")", "");
            tmp = replace(tmp, "(", "");
            tmp = replace(tmp, "&", "");
            if(tmp.length() > 0)
                wordList.add(tmp);
            start = end;
        }

        return (String[])wordList.toArray(new String[wordList.size()]);
    }

    public static String randomString(int length)
    {
        if(length < 1)
            return null;
        char randBuffer[] = new char[length];
        for(int i = 0; i < randBuffer.length; i++)
            randBuffer[i] = numbersAndLetters[randGen.nextInt(71)];

        return new String(randBuffer);
    }

    public static String chop(String string, int length)
    {
        if(string == null)
            return null;
        if(length <= 0)
            throw new IllegalArgumentException("Length must be > 0");
        if(string.length() <= length + 2)
        {
            return string;
        } else
        {
            StringBuffer buf = new StringBuffer(string.substring(0, length));
            buf.append("...");
            return buf.toString();
        }
    }

    public static String chopAtWord(String string, int length, int minLength)
    {
        if(length < 2)
            throw new IllegalArgumentException((new StringBuilder()).append("Length specified (").append(length).append(") must be > 2").toString());
        if(minLength >= length)
            throw new IllegalArgumentException("minLength must be smaller than length");
        int sLength = string != null ? string.length() : -1;
        if(sLength < 1)
            return string;
        if(minLength != -1 && sLength < minLength)
            return string;
        if(minLength == -1 && sLength < length)
            return string;

        char charArray[] = string.toCharArray();
        if(sLength > length)
        {
            sLength = length;
            for(int i = 0; i < sLength - 1; i++)
            {
                if(charArray[i] == '\r' && charArray[i + 1] == '\n')
                    return string.substring(0, i + 1);
                if(charArray[i] == '\n')
                    return string.substring(0, i);
            }

            if(charArray[sLength - 1] == '\n')
                return string.substring(0, sLength - 1);
            for(int i = sLength - 1; i > 0; i--)
                if(charArray[i] == ' ')
                    return string.substring(0, i).trim();

        } else
        if(minLength != -1 && sLength > minLength)
        {
            for(int i = 0; i < minLength; i++)
                if(charArray[i] == ' ')
                    return string;

        }
        if(minLength > -1 && minLength <= string.length())
            return string.substring(0, minLength);
        else
            return string.substring(0, length);
    }

    public static String chopAtWord(String string, int length)
    {
        return chopAtWord(string, length, -1);
    }

    public static String chopAtWordsAround(String input, String wordList[], int numChars)
    {
        if(input == null || "".equals(input.trim()) || wordList == null || wordList.length == 0 || numChars == 0)
            return "";
        String lc = input.toLowerCase();
        String arr$[] = wordList;
        int len$ = arr$.length;
        for(int i$ = 0; i$ < len$; i$++)
        {
            String aWordList = arr$[i$];
            int pos = lc.indexOf(aWordList);
            if(pos > -1)
            {
                int beginIdx = pos - numChars;
                if(beginIdx < 0)
                    beginIdx = 0;
                int endIdx = pos + numChars;
                if(endIdx > input.length() - 1)
                    endIdx = input.length() - 1;
                char chars[];
                for(chars = input.toCharArray(); beginIdx > 0 && chars[beginIdx] != ' ' && chars[beginIdx] != '\n' && chars[beginIdx] != '\r'; beginIdx--);
                for(; endIdx < input.length() && chars[endIdx] != ' ' && chars[endIdx] != '\n' && chars[endIdx] != '\r'; endIdx++);
                return input.substring(beginIdx, endIdx);
            }
        }

        return input.substring(0, input.length() < 200 ? input.length() : 200);
    }

    public static String wordWrap(String input, int width, Locale locale)
    {
        if(input == null)
            return "";
        if(width < 5)
            return input;
        if(width >= input.length())
            return input;
        if(locale == null)
            locale = JiveGlobals.getLocale();
        StringBuffer buf = new StringBuffer(input);
        boolean endOfLine = false;
        int lineStart = 0;
        for(int i = 0; i < buf.length(); i++)
        {
            if(buf.charAt(i) == '\n')
            {
                lineStart = i + 1;
                endOfLine = true;
            }
            if(i <= (lineStart + width) - 1)
                continue;
            if(!endOfLine)
            {
                int limit = i - lineStart - 1;
                BreakIterator breaks = BreakIterator.getLineInstance(locale);
                breaks.setText(buf.substring(lineStart, i));
                int end = breaks.last();
                if(end == limit + 1 && !Character.isWhitespace(buf.charAt(lineStart + end)))
                    end = breaks.preceding(end - 1);
                if(end != -1 && end == limit + 1)
                {
                    buf.replace(lineStart + end, lineStart + end + 1, "\n");
                    lineStart += end;
                    continue;
                }
                if(end != -1 && end != 0)
                {
                    buf.insert(lineStart + end, '\n');
                    lineStart = lineStart + end + 1;
                } else
                {
                    buf.insert(i, '\n');
                    lineStart = i + 1;
                }
            } else
            {
                buf.insert(i, '\n');
                lineStart = i + 1;
                endOfLine = false;
            }
        }

        return buf.toString();
    }

    public static String highlightWords(String string, String words[], String startHighlight, String endHighlight)
    {
        if(string == null || words == null || startHighlight == null || endHighlight == null)
            return null;
        StringBuffer regexp = new StringBuffer();
        regexp.append("(?i)\\b(");
        for(int x = 0; x < words.length; x++)
        {
            words[x] = words[x].replaceAll("([\\$\\?\\|\\/\\.\\}\\{])", "\\\\$1");
            regexp.append(words[x]);
            if(x != words.length - 1)
                regexp.append("|");
        }

        regexp.append(")");
        return string.replaceAll(regexp.toString(), (new StringBuilder()).append(startHighlight).append("$1").append(endHighlight).toString());
    }

    public static String escapeForSQL(String string)
    {
        if(string == null)
            return null;
        if(string.length() == 0)
            return string;
        char input[] = string.toCharArray();
        int i = 0;
        int last = 0;
        int len = input.length;
        StringBuffer out = null;
        for(; i < len; i++)
        {
            char ch = input[i];
            if(ch != '\'')
                continue;
            if(out == null)
                out = new StringBuffer(len + 2);
            if(i > last)
                out.append(input, last, i - last);
            last = i + 1;
            out.append('\'').append('\'');
        }

        if(out == null)
            return string;
        if(i > last)
            out.append(input, last, i - last);
        return out.toString();
    }

    public static String escapeForXML(String string)
    {
        if(string == null)
            return null;
        int i = 0;
        int last = 0;
        char input[] = string.toCharArray();
        int len = input.length;
        StringBuffer out = new StringBuffer((int)((double)len * 1.3D));
        for(; i < len; i++)
        {
            char ch = input[i];
            if(ch > '>')
                continue;
            if(ch == '<')
            {
                if(i > last)
                    out.append(input, last, i - last);
                last = i + 1;
                out.append(LT_ENCODE);
                continue;
            }
            if(ch == '>')
            {
                if(i > last)
                    out.append(input, last, i - last);
                last = i + 1;
                out.append(GT_ENCODE);
                continue;
            }
            if(ch == '&')
            {
                if(i > last)
                    out.append(input, last, i - last);
                last = i + 1;
                out.append(AMP_ENCODE);
                continue;
            }
            if(ch == '"')
            {
                if(i > last)
                    out.append(input, last, i - last);
                last = i + 1;
                out.append(QUOTE_ENCODE);
                continue;
            }
            if(ch == '\n' || ch == '\r' || ch == '\t' || ch >= ' ')
                continue;
            if(i > last)
                out.append(input, last, i - last);
            last = i + 1;
        }

        if(last == 0)
            return string;
        if(i > last)
            out.append(input, last, i - last);
        return out.toString();
    }

    public static String escapeEntitiesInXmlString(String xmlString)
    {
        xmlString = xmlString.replaceAll("&", String.valueOf(AMP_ENCODE));
        return xmlString;
    }

    public static String unescapeFromXML(String string)
    {
        string = replace(string, "&lt;", "<");
        string = replace(string, "&gt;", ">");
        string = replace(string, "&quot;", "\"");
        return replace(string, "&amp;", "&");
    }

    public static String zeroPadString(String string, int length)
    {
        if(string == null || string.length() > length)
        {
            return string;
        } else
        {
            StringBuffer buf = new StringBuffer(length);
            buf.append(zeroArray, 0, length - string.length()).append(string);
            return buf.toString();
        }
    }

    public static String dateToMillis(Date date)
    {
            return Long.toString(date.getTime());
    }

    public static boolean isValidEmailAddress(String addr)
    {
        if(addr == null)
            return false;
        addr = addr.trim();
        if(addr.length() == 0)
            return false;
        Matcher matcher = basicAddressPattern.matcher(addr);
        if(!matcher.matches())
            return false;
        String userPart = matcher.group(1);
        String domainPart = matcher.group(2);
        matcher = validUserPattern.matcher(userPart);
        if(!matcher.matches())
            return false;
        matcher = ipDomainPattern.matcher(domainPart);
        if(matcher.matches())
        {
            for(int i = 1; i < 5; i++)
            {
                String num = matcher.group(i);
                if(num == null)
                    return false;
                if(Integer.parseInt(num) > 254)
                    return false;
            }

            return true;
        }
        matcher = domainPattern.matcher(domainPart);
        if(matcher.matches())
        {
            String tld = matcher.group(matcher.groupCount());
            matcher = tldPattern.matcher(tld);
            return tld.length() == 3 || matcher.matches();
        } else
        {
            return "localhost".equals(domainPart);
        }
    }

    public static String removeIgnorableCharacters(String input)
    {
        if(input == null)
            return input;
        StringBuffer buf = new StringBuffer();
        char chars[] = input.toCharArray();
        int i = 0;
        for(int n = input.length(); i < n; i++)
            if(!Character.isIdentifierIgnorable(chars[i]))
                buf.append(chars[i]);

        return buf.toString();
    }

    public static String getSpacer(String spacer, int num)
    {
        if(num <= 1)
            return spacer;
        if(spacer == null || "".equals(spacer))
            return spacer;
        StringBuffer buf = new StringBuffer(spacer.length() * num);
        for(int i = 0; i < num; i++)
            buf.append(spacer);

        return buf.toString();
    }

    public static String abbreviate(String str, int maxWidth)
    {
        if(null == str)
            return null;
        if(str.length() <= maxWidth)
            return str;
        else
            return (new StringBuilder()).append(chopAtWord(str, maxWidth)).append("...").toString();
    }

    /**
     * @deprecated Method getTimeFromLong is deprecated
     */

    public static String getTimeFromLong(long time)
    {
        return getTimeFromLong(time, 2);
    }

    /**
     * @deprecated Method getTimeFromLong is deprecated
     */

    public static String getTimeFromLong(long time, int limit)
    {
        return (new DateUtils()).displayFriendly(time, limit);
    }

    public static boolean containsNonAlphanumeric(String str)
    {
        char testChars[] = str.toCharArray();
        char arr$[] = testChars;
        int len$ = arr$.length;
        for(int i$ = 0; i$ < len$; i$++)
        {
            char testChar = arr$[i$];
            if(!Character.isLetterOrDigit(testChar))
                return true;
        }

        return false;
    }

    public static String stripWhitespace(String str)
    {
        if(str == null)
            return null;
        Matcher matcher = WHITESPACE.matcher(str);
        StringBuffer buffer = new StringBuffer();
        for(; matcher.find(); matcher.appendReplacement(buffer, ""));
        matcher.appendTail(buffer);
        return buffer.toString();
    }

    public static boolean areEqualIgnoreCase(String s1, String s2)
    {
        if(s1 == null && s2 == null)
            return true;
        if(s1 != null)
        {
            s1 = s1.toLowerCase();
            return s2 != null && s1.equals(s2.toLowerCase());
        } else
        {
            return false;
        }
    }

    public static InputStream asStream(String data)
    {
        return new ByteArrayInputStream(data.getBytes());
    }

    public static String removeTag(String s, String html)
    {
        return removeTag(s, new StringBuilder(html)).toString();
    }

    private static StringBuilder removeSimpleTag(StringBuilder body, String tag)
    {
        return replaceAll(body, (new StringBuilder()).append("<").append(tag).append(" />").toString(), "");
    }

    public static StringBuilder removeTag(String s, StringBuilder html)
    {
        String tagBegin = (new StringBuilder()).append("<").append(s).append(" ").toString();
        String tagEnd = (new StringBuilder()).append("</").append(s).append(">").toString();
        int start = html.indexOf(tagBegin);
        do
        {
            if(start == -1)
                break;
            int end = html.indexOf(tagEnd, start + 1);
            if(end != -1)
            {
                html.replace(start, end, "");
                start = html.indexOf(tagBegin);
            }
        } while(true);
        return html;
    }

    public static StringBuilder removeTags(StringBuilder html, String tags[])
    {
        String arr$[] = tags;
        int len$ = arr$.length;
        for(int i$ = 0; i$ < len$; i$++)
        {
            String tag = arr$[i$];
            removeSimpleTag(html, tag);
            removeTag(tag, html);
        }

        return html;
    }

    private static String removeSimpleTag(String body, String tag)
    {
        String htmlTag = (new StringBuilder()).append("<").append(tag).append(" />").toString();
        return body.replace(htmlTag, "");
    }

    public static List occurs(String token, String s)
    {
        List locations = new ArrayList();
        int i = 0;
        do
        {
            if(i == -1)
                break;
            i = s.indexOf(token, i);
            if(i != -1)
            {
                locations.add(Integer.valueOf(i));
                i += token.length();
            }
        } while(true);
        return locations;
    }

    public static String upperCaseFirstChar(String s)
    {
        String first = String.valueOf(s.charAt(0));
        first = first.toUpperCase();
        StringBuilder builder = new StringBuilder();
        builder.append(first);
        builder.append(s.substring(1));
        return builder.toString();
    }

    public static boolean isWebSafeString(String str)
    {
        return isWebSafeString(str, "!'\",.?*@`~-+_=/\\:$");
    }

    public static boolean isWebSafeString(String str, String otherSafeCharacters)
    {
        if(str == null)
            throw new NullPointerException("String to be tested cannot be null");
        int sz = str.length();
        for(int i = 0; i < sz; i++)
        {
            char iChar = str.charAt(i);
            if(Character.isLetterOrDigit(iChar) || Character.isSpaceChar(iChar))
                continue;
            boolean found = false;
            int j = 0;
            do
            {
                if(j >= otherSafeCharacters.length())
                    break;
                char other = otherSafeCharacters.charAt(j);
                if(other == iChar)
                {
                    found = true;
                    break;
                }
                j++;
            } while(true);
            if(!found)
                return false;
        }

        return true;
    }

    public static String asString(List list)
    {
        if(list == null || list.isEmpty())
            return "";
        StringBuilder builder = new StringBuilder();
        for(Iterator i$ = list.iterator(); i$.hasNext(); builder.append(","))
        {
            long a = ((Long)i$.next()).longValue();
            builder.append(a);
        }

        if(builder.charAt(builder.length() - 1) == ',')
            builder.deleteCharAt(builder.length() - 1);
        return builder.toString();
    }

    public static List asList(String string)
    {
        if(string == null || "".equals(string))
            return new ArrayList();
        String tokens[] = string.split(",");
        ArrayList list = new ArrayList();
        String arr$[] = tokens;
        int len$ = arr$.length;
        for(int i$ = 0; i$ < len$; i$++)
        {
            String t = arr$[i$];
            try
            {
                long value = Long.parseLong(t);
                list.add(Long.valueOf(value));
            }
            catch(NumberFormatException e) { }
        }

        return list;
    }

    public static String lowerFirstChar(String name)
    {
        String result = name;
        if(name != null && name.length() > 1)
            result = (new StringBuilder()).append(name.substring(0, 1).toLowerCase()).append(name.substring(1, name.length())).toString();
        return result;
    }

    public static boolean isEqualToAnyOf(String s, String values[])
    {
        String arr$[] = values;
        int len$ = arr$.length;
        for(int i$ = 0; i$ < len$; i$++)
        {
            String value = arr$[i$];
            if(s.equals(value))
                return true;
        }

        return false;
    }

    public static  boolean isEqualToAnyOf(char c, char values[])
    {
        char arr$[] = values;
        int len$ = arr$.length;
        for(int i$ = 0; i$ < len$; i$++)
        {
            char value = arr$[i$];
            if(c == value)
                return true;
        }

        return false;
    }

    public static boolean isEqualToAnyOfIgnoreCase(String s, String values[])
    {
        s = s.toLowerCase();
        String arr$[] = values;
        int len$ = arr$.length;
        for(int i$ = 0; i$ < len$; i$++)
        {
            String value = arr$[i$];
            if(s.equals(value.toLowerCase()))
                return true;
        }

        return false;
    }

    public static String replaceAll(String text, String token, String repl)
    {
        return replaceAll(new StringBuilder(text), token, repl).toString();
    }

    public static String join(List elements, String joinWith)
    {
        if(elements == null || elements.size() == 0)
            return null;
        StringBuilder buffer = new StringBuilder(56);
        for(Iterator i$ = elements.iterator(); i$.hasNext(); buffer.append(joinWith))
        {
            String str = (String)i$.next();
            buffer.append(str);
        }

        return buffer.toString();
    }

    public static String join(String elements[], String joinWith)
    {
        if(elements == null || elements.length == 0)
            return null;
        StringBuilder buffer = new StringBuilder(56);
        String arr$[] = elements;
        int len$ = arr$.length;
        for(int i$ = 0; i$ < len$; i$++)
        {
            String str = arr$[i$];
            buffer.append(str);
            buffer.append(joinWith);
        }

        return buffer.toString();
    }

    public static StringBuilder replaceAll(StringBuilder text, String token, String repl)
    {
        int tokSize = token.length();
        int i = 0;
        do
        {
            if(i == -1)
                break;
            i = text.indexOf(token, i);
            if(i != -1)
            {
                text.replace(i, i + tokSize, repl);
                i += repl.length();
            }
        } while(true);
        return text;
    }

    public static String replaceAllKeys(String text, Map store)
    {
        StringBuilder stb = new StringBuilder(text);
        return replaceAllKeys(stb, store).toString();
    }

    public static StringBuilder replaceAllKeys(StringBuilder stb, Map store)
    {
        List uuids = new ArrayList(store.keySet());
        int loopCount = 0;
label0:
        for(int maxLoops = uuids.size(); uuids.size() > 0 && loopCount < maxLoops; loopCount++)
        {
            Iterator i$ = store.keySet().iterator();
            do
            {
                if(!i$.hasNext())
                    continue label0;
                String uuid = (String)i$.next();
                String value = (String)store.get(uuid);
                int idx = stb.indexOf(uuid);
                if(idx != -1)
                {
                    stb.replace(idx, idx + uuid.length(), value);
                    uuids.remove(uuid);
                }
            } while(true);
        }

        return stb;
    }

    public static String replaceHtmlEntitiesWithValueOpt(String stb)
    {
        int size = stb.length();
        StringReplacementHolder holder = new StringReplacementHolder(stb);
        int start = -1;
        for(int i = 0; i < size; i++)
        {
            if(start == -1 && stb.charAt(i) == '&')
            {
                start = i;
                continue;
            }
            if(isEqualToAnyOf(stb.charAt(i), new char[] {
    ' ', '\r', '\n'
}))
            {
                start = -1;
                continue;
            }
            if(start == -1 || stb.charAt(i) != ';')
                continue;
            String key = stb.substring(start, i + 1);
            if(HTML_ENTITY_MAP.containsKey(key))
                holder.addReplacement(start, i + 1, (String)HTML_ENTITY_MAP.get(key));
            start = -1;
        }

        return holder.apply();
    }

    public static String replaceHtmlEntitiesWithEmptyString(String stb)
    {
        Iterator i$ = HTML_ENTITY_MAP.keySet().iterator();
        do
        {
            if(!i$.hasNext())
                break;
            String key = (String)i$.next();
            if(stb.contains(key))
                stb = stb.replaceAll(key, "");
        } while(true);
        i$ = HTML_ENTITY_MAP.values().iterator();
        do
        {
            if(!i$.hasNext())
                break;
            String value = (String)i$.next();
            if(stb.contains(value))
                stb = stb.replaceAll(value, "");
        } while(true);
        return stb;
    }

    public static String getSpacer(char spacer, int num)
    {
        if(spacer == ' ' && num < WS_ARRAY.length)
            return new String(WS_ARRAY, 0, num);
        char space[] = new char[num];
        for(int i = 0; i < space.length; i++)
            space[i] = spacer;

        return new String(space);
    }

    public static boolean startsWithAnyOf(String s, String values[])
    {
        return startsWithAnyOf(s, ((Collection) (Arrays.asList(values))));
    }

    public static boolean startsWithAnyOf(String s, Collection values)
    {
        if(s == null)
            return false;
        for(Iterator i$ = values.iterator(); i$.hasNext();)
        {
            String value = (String)i$.next();
            if(s.startsWith(value))
                return true;
        }

        return false;
    }

    public static Map createMap(Object keys[], Object values[])
    {
        Map map = new HashMap();
        if(keys.length != values.length)
            return map;
        for(int i = 0; i < keys.length; i++)
            map.put(keys[i], values[i]);

        return map;
    }

    public static boolean endsWithAnyOf(String s, String values[])
    {
        return endsWithAnyOf(s, ((Collection) (Arrays.asList(values))));
    }

    public static boolean endsWithAnyOf(String s, Collection values)
    {
        if(s == null)
            return false;
        for(Iterator i$ = values.iterator(); i$.hasNext();)
        {
            String value = (String)i$.next();
            if(s.endsWith(value))
                return true;
        }

        return false;
    }

    public static boolean containsAnyOf(String s, String values[])
    {
        return containsAnyOf(s, ((Collection) (Arrays.asList(values))));
    }

    public static boolean containsAnyOf(String s, Collection values)
    {
        if(s == null)
            return false;
        for(Iterator i$ = values.iterator(); i$.hasNext();)
        {
            String value = (String)i$.next();
            if(s.contains(value))
                return true;
        }

        return false;
    }

    public static String URLDecode(String original, String charset)
    {
        original = original.replace('+', ' ');
        int idx = original.indexOf('%');
        if(idx != -1 && idx <= original.length() - 3 && isEqualToAnyOf(original.charAt(idx + 1), HEX_ENC_CHARS) && isEqualToAnyOf(original.charAt(idx + 2), HEX_ENC_CHARS))
            try
            {
                String decoded = URLDecoder.decode(original, charset);
                return decoded.replace('+', ' ');
            }
            catch(Exception e)
            {
                e.printStackTrace();
            }
        return original.replace('+', ' ');
    }

    public static String getShortDateFormat(Date date, Locale locale)
    {
        if(date == null)
            return "";
        DateFormat shortDateFormat;
        if(locale != null)
            shortDateFormat = DateFormat.getDateInstance(3, locale);
        else
            shortDateFormat = DateFormat.getDateInstance(3);
        return shortDateFormat.format(date);
    }

    public static String setURLParameter(String url, String paramName, String paramValue)
    {
        Map urlParameters = new LinkedHashMap();
        StringTokenizer queryStringTokenizer = new StringTokenizer(url, "?");
        String baseURL = queryStringTokenizer.nextToken();
        boolean isNewParameter = true;
        if(queryStringTokenizer.hasMoreTokens())
        {
            String strQueryString = queryStringTokenizer.nextToken();
            if(strQueryString != null)
            {
                for(StringTokenizer tokenizerNameValuePair = new StringTokenizer(strQueryString, "&"); tokenizerNameValuePair.hasMoreTokens();)
                    try
                    {
                        String strNameValuePair = tokenizerNameValuePair.nextToken();
                        StringTokenizer tokenizerValue = new StringTokenizer(strNameValuePair, "=");
                        String pName = tokenizerValue.nextToken();
                        String pValue = tokenizerValue.nextToken();
                        if(paramName.equals(pName))
                        {
                            pValue = paramValue;
                            isNewParameter = false;
                        }
                        urlParameters.put(pName, pValue);
                    }
                    catch(Throwable t) { }

            }
        }
        StringBuilder urlBuilder = (new StringBuilder(baseURL)).append("?");
        Iterator params = urlParameters.keySet().iterator();
        do
        {
            if(!params.hasNext())
                break;
            String pName = (String)params.next();
            String pValue = (String)urlParameters.get(pName);
            urlBuilder.append(pName).append("=").append(pValue);
            if(params.hasNext())
                urlBuilder.append("&");
        } while(true);
        if(isNewParameter)
            urlBuilder.append("&").append(paramName).append("=").append(paramValue);
        return urlBuilder.toString();
    }

    public static boolean isASCIIURLSafe(String str)
    {
        return str != null && !"".equals(str.trim()) && !URL_SAFE.matcher(str).find();
    }

    public static String makeURLSafe(String str)
    {
        return makeURLSafe(str, '-');
    }

    public static String makeURLSafe(String str, char replacement)
    {
        if(str == null || !isASCIIURLSafe(String.valueOf(replacement)))
            return null;
        String trimmed = str.trim();
        boolean ascii = str.trim().replaceAll((new StringBuilder()).append("([\\p{Punct}&&[^\\").append(replacement).append("]]+)").toString(), "").replaceAll((new StringBuilder()).append("([^A-Za-z\\").append(replacement).append("]+)").toString(), String.valueOf(replacement)).toLowerCase().replaceAll((new StringBuilder()).append("").append(replacement).toString(), "").replaceAll(" ", "").length() > 0;
        if(ascii)
        {
            trimmed = trimmed.replaceAll((new StringBuilder()).append("([\\p{Punct}&&[^\\").append(replacement).append("]]+)").toString(), "").replaceAll((new StringBuilder()).append("([^0-9A-Za-z\\").append(replacement).append("]+)").toString(), String.valueOf(replacement)).toLowerCase();
            if(trimmed.length() > 1 && (replacement == trimmed.charAt(0) || replacement == trimmed.charAt(trimmed.length() - 1)))
            {
                StringBuffer buf = new StringBuffer(trimmed);
                if(replacement == buf.charAt(0))
                    buf.deleteCharAt(0);
                if(replacement == buf.charAt(buf.length() - 1))
                    buf.deleteCharAt(buf.length() - 1);
                trimmed = buf.toString();
            }
        } else
        {
            boolean hasLetters = str.trim().replaceAll((new StringBuilder()).append("([\\p{Punct}&&[^\\").append(replacement).append("]]+)").toString(), "").replaceAll((new StringBuilder()).append("([^\\p{L}\\p{Nd}\\").append(replacement).append("]+)").toString(), String.valueOf(replacement)).replaceAll((new StringBuilder()).append("").append(replacement).toString(), "").replaceAll(" ", "").length() > 0;
            if(hasLetters)
            {
                trimmed = str.trim();
                boolean cantLowercase = trimmed.replaceAll((new StringBuilder()).append("([\\p{Punct}&&[^\\").append(replacement).append("]]+)").toString(), "").replaceAll((new StringBuilder()).append("([^\\p{Lo}\\").append(replacement).append("]+)").toString(), String.valueOf(replacement)).replaceAll((new StringBuilder()).append("").append(replacement).toString(), "").replaceAll(" ", "").length() > 0;
                trimmed = trimmed.replaceAll((new StringBuilder()).append("([\\p{Punct}&&[^\\").append(replacement).append("]]+)").toString(), "").replaceAll((new StringBuilder()).append("([^\\p{L}\\p{Nd}\\").append(replacement).append("]+)").toString(), String.valueOf(replacement));
                if(!cantLowercase)
                    trimmed = trimmed.toLowerCase();
            } else
            {
                trimmed = trimmed.toLowerCase();
            }
        }
        return "".equals(trimmed) || "-".equals(trimmed) ? String.valueOf(Math.abs(str.hashCode())) : trimmed;
    }

    public static String encodeVCard(String toEncode)
    {
        return encodeVCard(toEncode, false);
    }

    public static String encodeVCard(String toEncode, boolean isQuotedPrintable)
    {
        if(toEncode == null)
            return toEncode;
        String quotedPrintable = toEncode.replace(";", "\\;");
        if(isQuotedPrintable)
        {
            QuotedPrintableCodec codec = new QuotedPrintableCodec();
            try
            {
                quotedPrintable = codec.encode(quotedPrintable);
            }
            catch(EncoderException e)
            {
                throw new RuntimeException("Error encoding vcard", e);
            }
        }
        return quotedPrintable;
    }

    public static char[] clearOutofRangeXmlChars(String text)
    {
        char chars[] = text.toCharArray();
        for(int i = 0; i < chars.length; i++)
            if(chars[i] != '\t' && chars[i] != '\n' && chars[i] != '\r' && (chars[i] < ' ' || chars[i] > '\uD7FF') && (chars[i] < '\uE000' || chars[i] > '\uFFFD') && (chars[i] < '\0' || chars[i] > '\0'))
                chars[i] = ' ';

        return chars;
    }

    public static String[] slice(String source[], int start, int end)
    {
        if(source == null)
            return null;
        if(start == end)
            return new String[0];
        int e = Math.max(start, end);
        e = Math.min(e, source.length);
        int s = Math.min(start, end);
        String newArray[] = new String[e - s];
        int i = 0;
        for(; s < e; s++)
            newArray[i++] = source[s];

        return newArray;
    }

    public static String[] slice(String source[], int start)
    {
        if(source == null)
            return null;
        else
            return slice(source, start, source.length);
    }

    public static boolean isNullOrEmpty(String test)
    {
        return test == null || test.equals("");
    }

    public static String convertNonAscii(String s)
    {
        if(s == null)
            return null;
        StringBuffer sb = new StringBuffer();
        int n = s.length();
        for(int i = 0; i < n; i++)
        {
            char c = s.charAt(i);
            int pos = "\300\340\310\350\314\354\322\362\331\371\301\341\311\351\315\355\323\363\332\372\335\375\302\342\312\352\316\356\324\364\333\373\u0176\u0177\303\343\325\365\304\344\313\353\317\357\326\366\334\374\u0178\377\305\345\307\347".indexOf(c);
            if(pos > -1)
                sb.append("AaEeIiOoUuAaEeIiOoUuYyAaEeIiOoUuYyAaOoAaEeIiOoUuYyAaCc".charAt(pos));
            else
                sb.append(c);
        }

        return sb.toString();
    }

    public static boolean isRegex(String s)
    {
        return s.indexOf('*') != -1 || s.indexOf('\\') != -1 || s.indexOf('^') != -1 || s.indexOf('.') != -1 || s.indexOf('$') != -1 || s.indexOf('[') != -1 && s.indexOf(']') != -1 || s.indexOf('{') != -1 && s.indexOf('}') != -1;
    }

    static
    {
        String basicAddress = "^([\\w\\.-]+)@([\\w\\.-]+)$";
        String specialChars = "\\(\\)><@,;:\\\\\\\"\\.\\[\\]";
        String validChars = (new StringBuilder()).append("[^ \f\n\r\t").append(specialChars).append("]").toString();
        String atom = (new StringBuilder()).append(validChars).append("+").toString();
        String quotedUser = "(\"[^\"]+\")";
        String word = (new StringBuilder()).append("(").append(atom).append("|").append(quotedUser).append(")").toString();
        String validUser = (new StringBuilder()).append("^").append(word).append("(\\.").append(word).append(")*$").toString();
        String domain = (new StringBuilder()).append("^").append(atom).append("(\\.").append(atom).append(")+$").toString();
        String ipDomain = "^(\\d{1,3})\\.(\\d{1,3})\\.(\\d{1,3})\\.(\\d{1,3})$";
        String knownTLDs = "^\\.(com|net|org|edu|int|mil|gov|arpa|biz|aero|name|coop|info|pro|museum|mobi)$";
        basicAddressPattern = Pattern.compile(basicAddress, 2);
        validUserPattern = Pattern.compile(validUser, 2);
        domainPattern = Pattern.compile(domain, 2);
        ipDomainPattern = Pattern.compile(ipDomain, 2);
        tldPattern = Pattern.compile(knownTLDs, 2);
        base = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ".toCharArray();
        indexes = new int[256];
        Arrays.fill(indexes, -1);
        int i = 0;
        for(int iS = base.length; i < iS; i++)
            indexes[base[i]] = i;

        CA = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/".toCharArray();
        IA = new int[256];
        Arrays.fill(IA, -1);
        i = 0;
        for(int iS = CA.length; i < iS; i++)
            IA[CA[i]] = i;

        IA[61] = 0;
        allowed_query = new BitSet(256);
        for(i = 48; i <= 57; i++)
            allowed_query.set(i);

        for(i = 97; i <= 122; i++)
            allowed_query.set(i);

        for(i = 65; i <= 90; i++)
            allowed_query.set(i);

        allowed_query.set(45);
        allowed_query.set(95);
        allowed_query.set(46);
        allowed_query.set(33);
        allowed_query.set(126);
        allowed_query.set(42);
        allowed_query.set(39);
        allowed_query.set(40);
        allowed_query.set(41);
        WS_ARRAY = new char[256];
        for(i = 0; i < WS_ARRAY.length; i++)
            WS_ARRAY[i] = ' ';

        HTML_ENTITY_MAP = new HashMap();
        HTML_ENTITY_MAP.put("&nbsp;", "\240");
        HTML_ENTITY_MAP.put("&#160;", "\240");
        HTML_ENTITY_MAP.put("&iexcl;", "\241");
        HTML_ENTITY_MAP.put("&#161;", "\241");
        HTML_ENTITY_MAP.put("&cent;", "\242");
        HTML_ENTITY_MAP.put("&#162;", "\242");
        HTML_ENTITY_MAP.put("&pound;", "\243");
        HTML_ENTITY_MAP.put("&#163;", "\243");
        HTML_ENTITY_MAP.put("&curren;", "\244");
        HTML_ENTITY_MAP.put("&#164;", "\244");
        HTML_ENTITY_MAP.put("&yen;", "\245");
        HTML_ENTITY_MAP.put("&#165;", "\245");
        HTML_ENTITY_MAP.put("&brvbar;", "\246");
        HTML_ENTITY_MAP.put("&#166;", "\246");
        HTML_ENTITY_MAP.put("&sect;", "\247");
        HTML_ENTITY_MAP.put("&#167;", "\247");
        HTML_ENTITY_MAP.put("&uml;", "\250");
        HTML_ENTITY_MAP.put("&#168;", "\250");
        HTML_ENTITY_MAP.put("&copy;", "\251");
        HTML_ENTITY_MAP.put("&#169;", "\251");
        HTML_ENTITY_MAP.put("&ordf;", "\252");
        HTML_ENTITY_MAP.put("&#170;", "\252");
        HTML_ENTITY_MAP.put("&laquo;", "\253");
        HTML_ENTITY_MAP.put("&#171;", "\253");
        HTML_ENTITY_MAP.put("&not;", "\254");
        HTML_ENTITY_MAP.put("&#172;", "\254");
        HTML_ENTITY_MAP.put("&shy;", "\255");
        HTML_ENTITY_MAP.put("&#173;", "\255");
        HTML_ENTITY_MAP.put("&reg;", "\256");
        HTML_ENTITY_MAP.put("&#174;", "\256");
        HTML_ENTITY_MAP.put("&macr;", "\257");
        HTML_ENTITY_MAP.put("&#175;", "\257");
        HTML_ENTITY_MAP.put("&deg;", "\260");
        HTML_ENTITY_MAP.put("&#176;", "\260");
        HTML_ENTITY_MAP.put("&plusmn;", "\261");
        HTML_ENTITY_MAP.put("&#177;", "\261");
        HTML_ENTITY_MAP.put("&sup2;", "\262");
        HTML_ENTITY_MAP.put("&#178;", "\262");
        HTML_ENTITY_MAP.put("&sup3;", "\263");
        HTML_ENTITY_MAP.put("&#179;", "\263");
        HTML_ENTITY_MAP.put("&acute;", "\264");
        HTML_ENTITY_MAP.put("&#180;", "\264");
        HTML_ENTITY_MAP.put("&micro;", "\265");
        HTML_ENTITY_MAP.put("&#181;", "\265");
        HTML_ENTITY_MAP.put("&para;", "\266");
        HTML_ENTITY_MAP.put("&#182;", "\266");
        HTML_ENTITY_MAP.put("&middot;", "\267");
        HTML_ENTITY_MAP.put("&#183;", "\267");
        HTML_ENTITY_MAP.put("&cedil;", "\270");
        HTML_ENTITY_MAP.put("&#184;", "\270");
        HTML_ENTITY_MAP.put("&sup1;", "\271");
        HTML_ENTITY_MAP.put("&#185;", "\271");
        HTML_ENTITY_MAP.put("&ordm;", "\272");
        HTML_ENTITY_MAP.put("&#186;", "\272");
        HTML_ENTITY_MAP.put("&raquo;", "\273");
        HTML_ENTITY_MAP.put("&#187;", "\273");
        HTML_ENTITY_MAP.put("&frac14;", "\274");
        HTML_ENTITY_MAP.put("&#188;", "\274");
        HTML_ENTITY_MAP.put("&frac12;", "\275");
        HTML_ENTITY_MAP.put("&#189;", "\275");
        HTML_ENTITY_MAP.put("&frac34;", "\276");
        HTML_ENTITY_MAP.put("&#190;", "\276");
        HTML_ENTITY_MAP.put("&iquest;", "\277");
        HTML_ENTITY_MAP.put("&#191;", "\277");
        HTML_ENTITY_MAP.put("&Agrave;", "\300");
        HTML_ENTITY_MAP.put("&#192;", "\300");
        HTML_ENTITY_MAP.put("&Aacute;", "\301");
        HTML_ENTITY_MAP.put("&#193;", "\301");
        HTML_ENTITY_MAP.put("&Acirc;", "\302");
        HTML_ENTITY_MAP.put("&#194;", "\302");
        HTML_ENTITY_MAP.put("&Atilde;", "\303");
        HTML_ENTITY_MAP.put("&#195;", "\303");
        HTML_ENTITY_MAP.put("&Auml;", "\304");
        HTML_ENTITY_MAP.put("&#196;", "\304");
        HTML_ENTITY_MAP.put("&Aring;", "\305");
        HTML_ENTITY_MAP.put("&#197;", "\305");
        HTML_ENTITY_MAP.put("&AElig;", "\306");
        HTML_ENTITY_MAP.put("&#198;", "\306");
        HTML_ENTITY_MAP.put("&Ccedil;", "\307");
        HTML_ENTITY_MAP.put("&#199;", "\307");
        HTML_ENTITY_MAP.put("&Egrave;", "\310");
        HTML_ENTITY_MAP.put("&#200;", "\310");
        HTML_ENTITY_MAP.put("&Eacute;", "\311");
        HTML_ENTITY_MAP.put("&#201;", "\311");
        HTML_ENTITY_MAP.put("&Ecirc;", "\312");
        HTML_ENTITY_MAP.put("&#202;", "\312");
        HTML_ENTITY_MAP.put("&Euml;", "\313");
        HTML_ENTITY_MAP.put("&#203;", "\313");
        HTML_ENTITY_MAP.put("&Igrave;", "\314");
        HTML_ENTITY_MAP.put("&#204;", "\314");
        HTML_ENTITY_MAP.put("&Iacute;", "\315");
        HTML_ENTITY_MAP.put("&#205;", "\315");
        HTML_ENTITY_MAP.put("&Icirc;", "\316");
        HTML_ENTITY_MAP.put("&#206;", "\316");
        HTML_ENTITY_MAP.put("&Iuml;", "\317");
        HTML_ENTITY_MAP.put("&#207;", "\317");
        HTML_ENTITY_MAP.put("&ETH;", "\320");
        HTML_ENTITY_MAP.put("&#208;", "\320");
        HTML_ENTITY_MAP.put("&Ntilde;", "\321");
        HTML_ENTITY_MAP.put("&#209;", "\321");
        HTML_ENTITY_MAP.put("&Ograve;", "\322");
        HTML_ENTITY_MAP.put("&#210;", "\322");
        HTML_ENTITY_MAP.put("&Oacute;", "\323");
        HTML_ENTITY_MAP.put("&#211;", "\323");
        HTML_ENTITY_MAP.put("&Ocirc;", "\324");
        HTML_ENTITY_MAP.put("&#212;", "\324");
        HTML_ENTITY_MAP.put("&Otilde;", "\325");
        HTML_ENTITY_MAP.put("&#213;", "\325");
        HTML_ENTITY_MAP.put("&Ouml;", "\326");
        HTML_ENTITY_MAP.put("&#214;", "\326");
        HTML_ENTITY_MAP.put("&times;", "\327");
        HTML_ENTITY_MAP.put("&#215;", "\327");
        HTML_ENTITY_MAP.put("&Oslash;", "\330");
        HTML_ENTITY_MAP.put("&#216;", "\330");
        HTML_ENTITY_MAP.put("&Ugrave;", "\331");
        HTML_ENTITY_MAP.put("&#217;", "\331");
        HTML_ENTITY_MAP.put("&Uacute;", "\332");
        HTML_ENTITY_MAP.put("&#218;", "\332");
        HTML_ENTITY_MAP.put("&Ucirc;", "\333");
        HTML_ENTITY_MAP.put("&#219;", "\333");
        HTML_ENTITY_MAP.put("&Uuml;", "\334");
        HTML_ENTITY_MAP.put("&#220;", "\334");
        HTML_ENTITY_MAP.put("&Yacute;", "\335");
        HTML_ENTITY_MAP.put("&#221;", "\335");
        HTML_ENTITY_MAP.put("&THORN;", "\336");
        HTML_ENTITY_MAP.put("&#222;", "\336");
        HTML_ENTITY_MAP.put("&szlig;", "\337");
        HTML_ENTITY_MAP.put("&#223;", "\337");
        HTML_ENTITY_MAP.put("&agrave;", "\340");
        HTML_ENTITY_MAP.put("&#224;", "\340");
        HTML_ENTITY_MAP.put("&aacute;", "\341");
        HTML_ENTITY_MAP.put("&#225;", "\341");
        HTML_ENTITY_MAP.put("&acirc;", "\342");
        HTML_ENTITY_MAP.put("&#226;", "\342");
        HTML_ENTITY_MAP.put("&atilde;", "\343");
        HTML_ENTITY_MAP.put("&#227;", "\343");
        HTML_ENTITY_MAP.put("&auml;", "\344");
        HTML_ENTITY_MAP.put("&#228;", "\344");
        HTML_ENTITY_MAP.put("&aring;", "\345");
        HTML_ENTITY_MAP.put("&#229;", "\345");
        HTML_ENTITY_MAP.put("&aelig;", "\346");
        HTML_ENTITY_MAP.put("&#230;", "\346");
        HTML_ENTITY_MAP.put("&ccedil;", "\347");
        HTML_ENTITY_MAP.put("&#231;", "\347");
        HTML_ENTITY_MAP.put("&egrave;", "\350");
        HTML_ENTITY_MAP.put("&#232;", "\350");
        HTML_ENTITY_MAP.put("&eacute;", "\351");
        HTML_ENTITY_MAP.put("&#233;", "\351");
        HTML_ENTITY_MAP.put("&ecirc;", "\352");
        HTML_ENTITY_MAP.put("&#234;", "\352");
        HTML_ENTITY_MAP.put("&euml;", "\353");
        HTML_ENTITY_MAP.put("&#235;", "\353");
        HTML_ENTITY_MAP.put("&igrave;", "\354");
        HTML_ENTITY_MAP.put("&#236;", "\354");
        HTML_ENTITY_MAP.put("&iacute;", "\355");
        HTML_ENTITY_MAP.put("&#237;", "\355");
        HTML_ENTITY_MAP.put("&icirc;", "\356");
        HTML_ENTITY_MAP.put("&#238;", "\356");
        HTML_ENTITY_MAP.put("&iuml;", "\357");
        HTML_ENTITY_MAP.put("&#239;", "\357");
        HTML_ENTITY_MAP.put("&eth;", "\360");
        HTML_ENTITY_MAP.put("&#240;", "\360");
        HTML_ENTITY_MAP.put("&ntilde;", "\361");
        HTML_ENTITY_MAP.put("&#241;", "\361");
        HTML_ENTITY_MAP.put("&ograve;", "\362");
        HTML_ENTITY_MAP.put("&#242;", "\362");
        HTML_ENTITY_MAP.put("&oacute;", "\363");
        HTML_ENTITY_MAP.put("&#243;", "\363");
        HTML_ENTITY_MAP.put("&ocirc;", "\364");
        HTML_ENTITY_MAP.put("&#244;", "\364");
        HTML_ENTITY_MAP.put("&otilde;", "\365");
        HTML_ENTITY_MAP.put("&#245;", "\365");
        HTML_ENTITY_MAP.put("&ouml;", "\366");
        HTML_ENTITY_MAP.put("&#246;", "\366");
        HTML_ENTITY_MAP.put("&divide;", "\367");
        HTML_ENTITY_MAP.put("&#247;", "\367");
        HTML_ENTITY_MAP.put("&oslash;", "\370");
        HTML_ENTITY_MAP.put("&#248;", "\370");
        HTML_ENTITY_MAP.put("&ugrave;", "\371");
        HTML_ENTITY_MAP.put("&#249;", "\371");
        HTML_ENTITY_MAP.put("&uacute;", "\372");
        HTML_ENTITY_MAP.put("&#250;", "\372");
        HTML_ENTITY_MAP.put("&ucirc;", "\373");
        HTML_ENTITY_MAP.put("&#251;", "\373");
        HTML_ENTITY_MAP.put("&uuml;", "\374");
        HTML_ENTITY_MAP.put("&#252;", "\374");
        HTML_ENTITY_MAP.put("&yacute;", "\375");
        HTML_ENTITY_MAP.put("&#253;", "\375");
        HTML_ENTITY_MAP.put("&thorn;", "\376");
        HTML_ENTITY_MAP.put("&#254;", "\376");
        HTML_ENTITY_MAP.put("&yuml;", "\377");
        HTML_ENTITY_MAP.put("&#255;", "\377");
        HTML_ENTITY_MAP.put("&fnof;", "\u0192");
        HTML_ENTITY_MAP.put("&#402;", "\u0192");
        HTML_ENTITY_MAP.put("&Alpha;", "\u0391");
        HTML_ENTITY_MAP.put("&#913;", "\u0391");
        HTML_ENTITY_MAP.put("&Beta;", "\u0392");
        HTML_ENTITY_MAP.put("&#914;", "\u0392");
        HTML_ENTITY_MAP.put("&Gamma;", "\u0393");
        HTML_ENTITY_MAP.put("&#915;", "\u0393");
        HTML_ENTITY_MAP.put("&Delta;", "\u0394");
        HTML_ENTITY_MAP.put("&#916;", "\u0394");
        HTML_ENTITY_MAP.put("&Epsilon;", "\u0395");
        HTML_ENTITY_MAP.put("&#917;", "\u0395");
        HTML_ENTITY_MAP.put("&Zeta;", "\u0396");
        HTML_ENTITY_MAP.put("&#918;", "\u0396");
        HTML_ENTITY_MAP.put("&Eta;", "\u0397");
        HTML_ENTITY_MAP.put("&#919;", "\u0397");
        HTML_ENTITY_MAP.put("&Theta;", "\u0398");
        HTML_ENTITY_MAP.put("&#920;", "\u0398");
        HTML_ENTITY_MAP.put("&Iota;", "\u0399");
        HTML_ENTITY_MAP.put("&#921;", "\u0399");
        HTML_ENTITY_MAP.put("&Kappa;", "\u039A");
        HTML_ENTITY_MAP.put("&#922;", "\u039A");
        HTML_ENTITY_MAP.put("&Lambda;", "\u039B");
        HTML_ENTITY_MAP.put("&#923;", "\u039B");
        HTML_ENTITY_MAP.put("&Mu;", "\u039C");
        HTML_ENTITY_MAP.put("&#924;", "\u039C");
        HTML_ENTITY_MAP.put("&Nu;", "\u039D");
        HTML_ENTITY_MAP.put("&#925;", "\u039D");
        HTML_ENTITY_MAP.put("&Xi;", "\u039E");
        HTML_ENTITY_MAP.put("&#926;", "\u039E");
        HTML_ENTITY_MAP.put("&Omicron;", "\u039F");
        HTML_ENTITY_MAP.put("&#927;", "\u039F");
        HTML_ENTITY_MAP.put("&Pi;", "\u03A0");
        HTML_ENTITY_MAP.put("&#928;", "\u03A0");
        HTML_ENTITY_MAP.put("&Rho;", "\u03A1");
        HTML_ENTITY_MAP.put("&#929;", "\u03A1");
        HTML_ENTITY_MAP.put("&Sigma;", "\u03A3");
        HTML_ENTITY_MAP.put("&#931;", "\u03A3");
        HTML_ENTITY_MAP.put("&Tau;", "\u03A4");
        HTML_ENTITY_MAP.put("&#932;", "\u03A4");
        HTML_ENTITY_MAP.put("&Upsilon;", "\u03A5");
        HTML_ENTITY_MAP.put("&#933;", "\u03A5");
        HTML_ENTITY_MAP.put("&Phi;", "\u03A6");
        HTML_ENTITY_MAP.put("&#934;", "\u03A6");
        HTML_ENTITY_MAP.put("&Chi;", "\u03A7");
        HTML_ENTITY_MAP.put("&#935;", "\u03A7");
        HTML_ENTITY_MAP.put("&Psi;", "\u03A8");
        HTML_ENTITY_MAP.put("&#936;", "\u03A8");
        HTML_ENTITY_MAP.put("&Omega;", "\u03A9");
        HTML_ENTITY_MAP.put("&#937;", "\u03A9");
        HTML_ENTITY_MAP.put("&alpha;", "\u03B1");
        HTML_ENTITY_MAP.put("&#945;", "\u03B1");
        HTML_ENTITY_MAP.put("&beta;", "\u03B2");
        HTML_ENTITY_MAP.put("&#946;", "\u03B2");
        HTML_ENTITY_MAP.put("&gamma;", "\u03B3");
        HTML_ENTITY_MAP.put("&#947;", "\u03B3");
        HTML_ENTITY_MAP.put("&delta;", "\u03B4");
        HTML_ENTITY_MAP.put("&#948;", "\u03B4");
        HTML_ENTITY_MAP.put("&epsilon;", "\u03B5");
        HTML_ENTITY_MAP.put("&#949;", "\u03B5");
        HTML_ENTITY_MAP.put("&zeta;", "\u03B6");
        HTML_ENTITY_MAP.put("&#950;", "\u03B6");
        HTML_ENTITY_MAP.put("&eta;", "\u03B7");
        HTML_ENTITY_MAP.put("&#951;", "\u03B7");
        HTML_ENTITY_MAP.put("&theta;", "\u03B8");
        HTML_ENTITY_MAP.put("&#952;", "\u03B8");
        HTML_ENTITY_MAP.put("&iota;", "\u03B9");
        HTML_ENTITY_MAP.put("&#953;", "\u03B9");
        HTML_ENTITY_MAP.put("&kappa;", "\u03BA");
        HTML_ENTITY_MAP.put("&#954;", "\u03BA");
        HTML_ENTITY_MAP.put("&lambda;", "\u03BB");
        HTML_ENTITY_MAP.put("&#955;", "\u03BB");
        HTML_ENTITY_MAP.put("&mu;", "\u03BC");
        HTML_ENTITY_MAP.put("&#956;", "\u03BC");
        HTML_ENTITY_MAP.put("&nu;", "\u03BD");
        HTML_ENTITY_MAP.put("&#957;", "\u03BD");
        HTML_ENTITY_MAP.put("&xi;", "\u03BE");
        HTML_ENTITY_MAP.put("&#958;", "\u03BE");
        HTML_ENTITY_MAP.put("&omicron;", "\u03BF");
        HTML_ENTITY_MAP.put("&#959;", "\u03BF");
        HTML_ENTITY_MAP.put("&pi;", "\u03C0");
        HTML_ENTITY_MAP.put("&#960;", "\u03C0");
        HTML_ENTITY_MAP.put("&rho;", "\u03C1");
        HTML_ENTITY_MAP.put("&#961;", "\u03C1");
        HTML_ENTITY_MAP.put("&sigmaf;", "\u03C2");
        HTML_ENTITY_MAP.put("&#962;", "\u03C2");
        HTML_ENTITY_MAP.put("&sigma;", "\u03C3");
        HTML_ENTITY_MAP.put("&#963;", "\u03C3");
        HTML_ENTITY_MAP.put("&tau;", "\u03C4");
        HTML_ENTITY_MAP.put("&#964;", "\u03C4");
        HTML_ENTITY_MAP.put("&upsilon;", "\u03C5");
        HTML_ENTITY_MAP.put("&#965;", "\u03C5");
        HTML_ENTITY_MAP.put("&phi;", "\u03C6");
        HTML_ENTITY_MAP.put("&#966;", "\u03C6");
        HTML_ENTITY_MAP.put("&chi;", "\u03C7");
        HTML_ENTITY_MAP.put("&#967;", "\u03C7");
        HTML_ENTITY_MAP.put("&psi;", "\u03C8");
        HTML_ENTITY_MAP.put("&#968;", "\u03C8");
        HTML_ENTITY_MAP.put("&omega;", "\u03C9");
        HTML_ENTITY_MAP.put("&#969;", "\u03C9");
        HTML_ENTITY_MAP.put("&thetasym;", "\u03D1");
        HTML_ENTITY_MAP.put("&#977;", "\u03D1");
        HTML_ENTITY_MAP.put("&upsih;", "\u03D2");
        HTML_ENTITY_MAP.put("&#978;", "\u03D2");
        HTML_ENTITY_MAP.put("&piv;", "\u03D6");
        HTML_ENTITY_MAP.put("&#982;", "\u03D6");
        HTML_ENTITY_MAP.put("&bull;", "\u2022");
        HTML_ENTITY_MAP.put("&#8226;", "\u2022");
        HTML_ENTITY_MAP.put("&hellip;", "\u2026");
        HTML_ENTITY_MAP.put("&#8230;", "\u2026");
        HTML_ENTITY_MAP.put("&prime;", "\u2032");
        HTML_ENTITY_MAP.put("&#8242;", "\u2032");
        HTML_ENTITY_MAP.put("&Prime;", "\u2033");
        HTML_ENTITY_MAP.put("&#8243;", "\u2033");
        HTML_ENTITY_MAP.put("&oline;", "\u203E");
        HTML_ENTITY_MAP.put("&#8254;", "\u203E");
        HTML_ENTITY_MAP.put("&frasl;", "\u2044");
        HTML_ENTITY_MAP.put("&#8260;", "\u2044");
        HTML_ENTITY_MAP.put("&weierp;", "\u2118");
        HTML_ENTITY_MAP.put("&#8472;", "\u2118");
        HTML_ENTITY_MAP.put("&image;", "\u2111");
        HTML_ENTITY_MAP.put("&#8465;", "\u2111");
        HTML_ENTITY_MAP.put("&real;", "\u211C");
        HTML_ENTITY_MAP.put("&#8476;", "\u211C");
        HTML_ENTITY_MAP.put("&trade;", "\u2122");
        HTML_ENTITY_MAP.put("&#8482;", "\u2122");
        HTML_ENTITY_MAP.put("&alefsym;", "\u2135");
        HTML_ENTITY_MAP.put("&#8501;", "\u2135");
        HTML_ENTITY_MAP.put("&larr;", "\u2190");
        HTML_ENTITY_MAP.put("&#8592;", "\u2190");
        HTML_ENTITY_MAP.put("&uarr;", "\u2191");
        HTML_ENTITY_MAP.put("&#8593;", "\u2191");
        HTML_ENTITY_MAP.put("&rarr;", "\u2192");
        HTML_ENTITY_MAP.put("&#8594;", "\u2192");
        HTML_ENTITY_MAP.put("&darr;", "\u2193");
        HTML_ENTITY_MAP.put("&#8595;", "\u2193");
        HTML_ENTITY_MAP.put("&harr;", "\u2194");
        HTML_ENTITY_MAP.put("&#8596;", "\u2194");
        HTML_ENTITY_MAP.put("&crarr;", "\u21B5");
        HTML_ENTITY_MAP.put("&#8629;", "\u21B5");
        HTML_ENTITY_MAP.put("&lArr;", "\u21D0");
        HTML_ENTITY_MAP.put("&#8656;", "\u21D0");
        HTML_ENTITY_MAP.put("&uArr;", "\u21D1");
        HTML_ENTITY_MAP.put("&#8657;", "\u21D1");
        HTML_ENTITY_MAP.put("&rArr;", "\u21D2");
        HTML_ENTITY_MAP.put("&#8658;", "\u21D2");
        HTML_ENTITY_MAP.put("&dArr;", "\u21D3");
        HTML_ENTITY_MAP.put("&#8659;", "\u21D3");
        HTML_ENTITY_MAP.put("&hArr;", "\u21D4");
        HTML_ENTITY_MAP.put("&#8660;", "\u21D4");
        HTML_ENTITY_MAP.put("&forall;", "\u2200");
        HTML_ENTITY_MAP.put("&#8704;", "\u2200");
        HTML_ENTITY_MAP.put("&part;", "\u2202");
        HTML_ENTITY_MAP.put("&#8706;", "\u2202");
        HTML_ENTITY_MAP.put("&exist;", "\u2203");
        HTML_ENTITY_MAP.put("&#8707;", "\u2203");
        HTML_ENTITY_MAP.put("&empty;", "\u2205");
        HTML_ENTITY_MAP.put("&#8709;", "\u2205");
        HTML_ENTITY_MAP.put("&nabla;", "\u2207");
        HTML_ENTITY_MAP.put("&#8711;", "\u2207");
        HTML_ENTITY_MAP.put("&isin;", "\u2208");
        HTML_ENTITY_MAP.put("&#8712;", "\u2208");
        HTML_ENTITY_MAP.put("&notin;", "\u2209");
        HTML_ENTITY_MAP.put("&#8713;", "\u2209");
        HTML_ENTITY_MAP.put("&ni;", "\u220B");
        HTML_ENTITY_MAP.put("&#8715;", "\u220B");
        HTML_ENTITY_MAP.put("&prod;", "\u220F");
        HTML_ENTITY_MAP.put("&#8719;", "\u220F");
        HTML_ENTITY_MAP.put("&sum;", "\u2211");
        HTML_ENTITY_MAP.put("&#8721;", "\u2211");
        HTML_ENTITY_MAP.put("&minus;", "\u2212");
        HTML_ENTITY_MAP.put("&#8722;", "\u2212");
        HTML_ENTITY_MAP.put("&lowast;", "\u2217");
        HTML_ENTITY_MAP.put("&#8727;", "\u2217");
        HTML_ENTITY_MAP.put("&radic;", "\u221A");
        HTML_ENTITY_MAP.put("&#8730;", "\u221A");
        HTML_ENTITY_MAP.put("&prop;", "\u221D");
        HTML_ENTITY_MAP.put("&#8733;", "\u221D");
        HTML_ENTITY_MAP.put("&infin;", "\u221E");
        HTML_ENTITY_MAP.put("&#8734;", "\u221E");
        HTML_ENTITY_MAP.put("&ang;", "\u2220");
        HTML_ENTITY_MAP.put("&#8736;", "\u2220");
        HTML_ENTITY_MAP.put("&and;", "\u2227");
        HTML_ENTITY_MAP.put("&#8743;", "\u2227");
        HTML_ENTITY_MAP.put("&or;", "\u2228");
        HTML_ENTITY_MAP.put("&#8744;", "\u2228");
        HTML_ENTITY_MAP.put("&cap;", "\u2229");
        HTML_ENTITY_MAP.put("&#8745;", "\u2229");
        HTML_ENTITY_MAP.put("&cup;", "\u222A");
        HTML_ENTITY_MAP.put("&#8746;", "\u222A");
        HTML_ENTITY_MAP.put("&int;", "\u222B");
        HTML_ENTITY_MAP.put("&#8747;", "\u222B");
        HTML_ENTITY_MAP.put("&there4;", "\u2234");
        HTML_ENTITY_MAP.put("&#8756;", "\u2234");
        HTML_ENTITY_MAP.put("&sim;", "\u223C");
        HTML_ENTITY_MAP.put("&#8764;", "\u223C");
        HTML_ENTITY_MAP.put("&cong;", "\u2245");
        HTML_ENTITY_MAP.put("&#8773;", "\u2245");
        HTML_ENTITY_MAP.put("&asymp;", "\u2248");
        HTML_ENTITY_MAP.put("&#8776;", "\u2248");
        HTML_ENTITY_MAP.put("&ne;", "\u2260");
        HTML_ENTITY_MAP.put("&#8800;", "\u2260");
        HTML_ENTITY_MAP.put("&equiv;", "\u2261");
        HTML_ENTITY_MAP.put("&#8801;", "\u2261");
        HTML_ENTITY_MAP.put("&le;", "\u2264");
        HTML_ENTITY_MAP.put("&#8804;", "\u2264");
        HTML_ENTITY_MAP.put("&ge;", "\u2265");
        HTML_ENTITY_MAP.put("&#8805;", "\u2265");
        HTML_ENTITY_MAP.put("&sub;", "\u2282");
        HTML_ENTITY_MAP.put("&#8834;", "\u2282");
        HTML_ENTITY_MAP.put("&sup;", "\u2283");
        HTML_ENTITY_MAP.put("&#8835;", "\u2283");
        HTML_ENTITY_MAP.put("&sube;", "\u2286");
        HTML_ENTITY_MAP.put("&#8838;", "\u2286");
        HTML_ENTITY_MAP.put("&supe;", "\u2287");
        HTML_ENTITY_MAP.put("&#8839;", "\u2287");
        HTML_ENTITY_MAP.put("&oplus;", "\u2295");
        HTML_ENTITY_MAP.put("&#8853;", "\u2295");
        HTML_ENTITY_MAP.put("&otimes;", "\u2297");
        HTML_ENTITY_MAP.put("&#8855;", "\u2297");
        HTML_ENTITY_MAP.put("&perp;", "\u22A5");
        HTML_ENTITY_MAP.put("&#8869;", "\u22A5");
        HTML_ENTITY_MAP.put("&sdot;", "\u22C5");
        HTML_ENTITY_MAP.put("&#8901;", "\u22C5");
        HTML_ENTITY_MAP.put("&lceil;", "\u2308");
        HTML_ENTITY_MAP.put("&#8968;", "\u2308");
        HTML_ENTITY_MAP.put("&rceil;", "\u2309");
        HTML_ENTITY_MAP.put("&#8969;", "\u2309");
        HTML_ENTITY_MAP.put("&lfloor;", "\u230A");
        HTML_ENTITY_MAP.put("&#8970;", "\u230A");
        HTML_ENTITY_MAP.put("&rfloor;", "\u230B");
        HTML_ENTITY_MAP.put("&#8971;", "\u230B");
        HTML_ENTITY_MAP.put("&lang;", "\u2329");
        HTML_ENTITY_MAP.put("&#9001;", "\u2329");
        HTML_ENTITY_MAP.put("&rang;", "\u232A");
        HTML_ENTITY_MAP.put("&#9002;", "\u232A");
        HTML_ENTITY_MAP.put("&loz;", "\u25CA");
        HTML_ENTITY_MAP.put("&#9674;", "\u25CA");
        HTML_ENTITY_MAP.put("&spades;", "\u2660");
        HTML_ENTITY_MAP.put("&#9824;", "\u2660");
        HTML_ENTITY_MAP.put("&clubs;", "\u2663");
        HTML_ENTITY_MAP.put("&#9827;", "\u2663");
        HTML_ENTITY_MAP.put("&hearts;", "\u2665");
        HTML_ENTITY_MAP.put("&#9829;", "\u2665");
        HTML_ENTITY_MAP.put("&diams;", "\u2666");
        HTML_ENTITY_MAP.put("&#9830;", "\u2666");
        HTML_ENTITY_MAP.put("&OElig;", "\u0152");
        HTML_ENTITY_MAP.put("&#338;", "\u0152");
        HTML_ENTITY_MAP.put("&oelig;", "\u0153");
        HTML_ENTITY_MAP.put("&#339;", "\u0153");
        HTML_ENTITY_MAP.put("&Scaron;", "\u0160");
        HTML_ENTITY_MAP.put("&#352;", "\u0160");
        HTML_ENTITY_MAP.put("&scaron;", "\u0161");
        HTML_ENTITY_MAP.put("&#353;", "\u0161");
        HTML_ENTITY_MAP.put("&Yuml;", "\u0178");
        HTML_ENTITY_MAP.put("&#376;", "\u0178");
        HTML_ENTITY_MAP.put("&circ;", "\u02C6");
        HTML_ENTITY_MAP.put("&#710;", "\u02C6");
        HTML_ENTITY_MAP.put("&tilde;", "\u02DC");
        HTML_ENTITY_MAP.put("&#732;", "\u02DC");
        HTML_ENTITY_MAP.put("&ensp;", "\u2002");
        HTML_ENTITY_MAP.put("&#8194;", "\u2002");
        HTML_ENTITY_MAP.put("&emsp;", "\u2003");
        HTML_ENTITY_MAP.put("&#8195;", "\u2003");
        HTML_ENTITY_MAP.put("&thinsp;", "\u2009");
        HTML_ENTITY_MAP.put("&#8201;", "\u2009");
        HTML_ENTITY_MAP.put("&zwnj;", "\u200C");
        HTML_ENTITY_MAP.put("&#8204;", "\u200C");
        HTML_ENTITY_MAP.put("&zwj;", "\u200D");
        HTML_ENTITY_MAP.put("&#8205;", "\u200D");
        HTML_ENTITY_MAP.put("&lrm;", "\u200E");
        HTML_ENTITY_MAP.put("&#8206;", "\u200E");
        HTML_ENTITY_MAP.put("&rlm;", "\u200F");
        HTML_ENTITY_MAP.put("&#8207;", "\u200F");
        HTML_ENTITY_MAP.put("&ndash;", "\u2013");
        HTML_ENTITY_MAP.put("&#8211;", "\u2013");
        HTML_ENTITY_MAP.put("&mdash;", "\u2014");
        HTML_ENTITY_MAP.put("&#8212;", "\u2014");
        HTML_ENTITY_MAP.put("&lsquo;", "\u2018");
        HTML_ENTITY_MAP.put("&#8216;", "\u2018");
        HTML_ENTITY_MAP.put("&rsquo;", "\u2019");
        HTML_ENTITY_MAP.put("&#8217;", "\u2019");
        HTML_ENTITY_MAP.put("&sbquo;", "\u201A");
        HTML_ENTITY_MAP.put("&#8218;", "\u201A");
        HTML_ENTITY_MAP.put("&ldquo;", "\u201C");
        HTML_ENTITY_MAP.put("&#8220;", "\u201C");
        HTML_ENTITY_MAP.put("&rdquo;", "\u201D");
        HTML_ENTITY_MAP.put("&#8221;", "\u201D");
        HTML_ENTITY_MAP.put("&bdquo;", "\u201E");
        HTML_ENTITY_MAP.put("&#8222;", "\u201E");
        HTML_ENTITY_MAP.put("&dagger;", "\u2020");
        HTML_ENTITY_MAP.put("&#8224;", "\u2020");
        HTML_ENTITY_MAP.put("&Dagger;", "\u2021");
        HTML_ENTITY_MAP.put("&#8225;", "\u2021");
        HTML_ENTITY_MAP.put("&permil;", "\u2030");
        HTML_ENTITY_MAP.put("&#8240;", "\u2030");
        HTML_ENTITY_MAP.put("&lsaquo;", "\u2039");
        HTML_ENTITY_MAP.put("&#8249;", "\u2039");
        HTML_ENTITY_MAP.put("&rsaquo;", "\u203A");
        HTML_ENTITY_MAP.put("&#8250;", "\u203A");
        HTML_ENTITY_MAP.put("&euro;", "\u20AC");
        HTML_ENTITY_MAP.put("&#8364;", "\u20AC");
    }
}
