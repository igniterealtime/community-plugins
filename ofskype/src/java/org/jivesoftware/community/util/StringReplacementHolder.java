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

import java.util.*;

public class StringReplacementHolder
{
    private String source;
    private List replacements;

    class Replacement
    {
        private int start;
        private int end;
        private String repl;
        final StringReplacementHolder stringReplacementHolder;

        public Replacement(int start, int end, String repl)
        {
            super();

            stringReplacementHolder = StringReplacementHolder.this;
            this.start = start;
            this.end = end;
            this.repl = repl;
        }
    }


    public StringReplacementHolder(String source)
    {
        replacements = new ArrayList();
        this.source = source;
    }

    public void addReplacement(int start, int end, String repl)
    {
        replacements.add(new Replacement(start, end, repl));
    }

    public String getSource()
    {
        return source;
    }

    public String apply()
    {
        StringBuilder stb = new StringBuilder(source);
        int offset = 0;

        for(Iterator i = replacements.iterator(); i.hasNext();)
        {
            Replacement replacement = (Replacement)i.next();
            stb.replace(offset + replacement.start, offset + replacement.end, replacement.repl);
            offset += replacement.repl.length() - (replacement.end - replacement.start);
        }

        return stb.toString();
    }
}
