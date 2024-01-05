export class Constant{

    // public static phpServiceURL = "/Aviom/";
    // public static phpServiceURL = "http://www.trinityapplab.in/Aviom/";
    // public static phpServiceURL = "https://shakti.aviom.co/";
    public static phpServiceURL = "/";
    
    public static SUCCESSFUL_STATUS_CODE = "100000";
    public static NO_RECORDS_FOUND_CODE = "102001";
    public static TRINITY_PRIVATE_KEY = "TRINITYPRIVATEKEY";
    public static TOSTER_FADEOUT_TIME = 1000;
    public static ALERT_FADEOUT_TIME = 2000;
    public static STORE_KEY =  'lastAction';
    public static CHECK_INTERVAL = 15000; // in ms
    public static MINUTES_UNTIL_AUTO_LOGOUT = 10; // in mins
    
    public static returnServerErrorMessage(serviceName:string):string{
        return "Server error while invoking "+serviceName+ " service";
    }
    
}