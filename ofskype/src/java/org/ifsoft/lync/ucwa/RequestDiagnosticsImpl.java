package org.ifsoft.lync.ucwa;

import com.google.common.collect.Lists;
import java.util.List;

public class RequestDiagnosticsImpl implements RequestDiagnostics
{
    private boolean success;
    private List errors;


    public RequestDiagnosticsImpl()
    {
        success = true;
        errors = (List)Lists.newArrayList();
    }

    public boolean isSuccess()
    {
        return success;
    }

    public List getErrors()
    {
        return errors;
    }

    public RequestDiagnostics fail()
    {
        success = false;
        return this;
    }

    public RequestDiagnostics dueTo(String errorMessage)
    {
        errors.add(errorMessage);
        return this;
    }
}
