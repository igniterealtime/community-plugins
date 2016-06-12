package org.ifsoft.openlink.calllog;

import java.util.List;

public class CallFilter {

    private String SQL;
    private List<String> values;

    public CallFilter(String SQL, List<String> values) {
        this.SQL = SQL;
        this.values = values;
    }

    public void setSQL(String SQL) {
        this.SQL = SQL;
    }

    public List<String> getValues() {
        return values;
    }

    public String getSQL() {
        return SQL;
    }
}