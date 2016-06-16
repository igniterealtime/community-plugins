package org.ifsoft.lync.ucwa;


public class ProviderStatus
{
    private String errorMessage;
    private ErrorCode errorCode;

    public ProviderStatus()
    {
        errorCode = ErrorCode.UNASSIGNED;
    }

    public ErrorCode getErrorCode()
    {
        return errorCode;
    }

    public void setErrorCode(ErrorCode errorCode)
    {
        this.errorCode = errorCode;
    }

    public String getErrorMessage()
    {
        return errorMessage;
    }

    public void setErrorMessage(String errorMessage)
    {
        this.errorMessage = errorMessage;
    }

    public String toString()
    {
        return (new StringBuilder("ProviderStatus{errorCode=")).append(errorCode).append(", errorMessage='").append(errorMessage).append('\'').append('}').toString();
    }
}
