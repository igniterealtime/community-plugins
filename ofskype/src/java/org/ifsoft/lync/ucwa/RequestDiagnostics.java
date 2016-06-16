package org.ifsoft.lync.ucwa;

import java.util.List;

public interface RequestDiagnostics
{
    public abstract boolean isSuccess();

    public abstract List getErrors();

    public abstract RequestDiagnostics fail();

    public abstract RequestDiagnostics dueTo(String s);
}
