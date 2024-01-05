import { Injectable } from '@angular/core';
import { Http , RequestOptions , Response , Headers } from '@angular/http';
import { Observable } from 'rxjs';
import 'rxjs/Rx';
import { Constant } from '../constant/Contant';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class SharedService{
    private phpServicePoint;
    constructor(private http:Http, private httpClient:HttpClient){
        this.phpServicePoint = Constant.phpServiceURL;
    }

    public authenticate(jsonData:any){
        let bodyString = JSON.stringify(jsonData);
        return this.http.post(this.phpServicePoint+'authenticateEnc.php',bodyString)
               .map((response:Response) => response.json())
               .catch((error:any) => Observable.throw(error.json().error || 'Server error'));
    }

    public getMenuListByRoleName(jsonData : any){
        return this.http.post(this.phpServicePoint+'getMenuByEmpRole.php',jsonData)
               .map((response:Response) => response.json())
               .catch((error:any) => Observable.throw(error.json().error || 'Server error'));
    }

    public getMenuTrasactions(jsonData : any){

        return this.http.post(this.phpServicePoint+'getMenuTrasactions.php',jsonData)
        .map((response:Response) => response.json())
        .catch((error:any) => Observable.throw(error.json().error || 'Server error'));
    }

    public getMenuTrasactionsDet(jsonData : any){
        
        return this.http.post(this.phpServicePoint+'getMenuTrasactionsDet.php',jsonData)
        .map((response:Response) => response.json())
        .catch((error:any) => Observable.throw(error.json().error || 'Server error'));
    }

    public changeTransactionStatus(jsonData : any){
        
        return this.http.post(this.phpServicePoint+'changeTransactionStatus.php',jsonData)
        .map((response:Response) => response.json())
        .catch((error:any) => Observable.throw(error.json().error || 'Server error'));
    }

    public getCategorySubcategoryByRole(jsonData:  any) {
        return this.http.post(this.phpServicePoint+'getCategorySubcategoryByRole.php',jsonData)
               .map((response:Response) => response.json())
               .catch((error:any) => Observable.throw(error.json().error || 'Server error'));
    }

    public sendOTP(jsonData: any) {
               return this.http.post(this.phpServicePoint+'sendOTPtoMobile.php',jsonData)
               .map((response:Response) => response.json())
               .catch((error:any) => Observable.throw(error.json().error || 'Server error'));
    }

    public changePassword(jsonData: any) {
        
        return this.http.post(this.phpServicePoint+'changePasswordEnc.php',jsonData)
               .map((response:Response) => response.json())
               .catch((error:any) => Observable.throw(error.json().error || 'Server error'));
    }

    public getAllList(searchType : string, tenentId : any) {
        return this.http.get(this.phpServicePoint+'assignToEmp.php?searchType='+searchType+'&tenentId='+tenentId)
               .map((response:Response) => response.json())
               .catch((error:any) => Observable.throw(error.json().error || 'Server error'));
    }

    public submitDataByInsertType(jsonData: any,insertType : string) {
        return this.http.post(this.phpServicePoint+'insertInTable.php?insertType='+insertType,jsonData)
               .map((response:Response) => response.json())
               .catch((error:any) => Observable.throw(error.json().error || 'Server error'));
    }

    public insertDataByInsertType(jsonData: any, insertType : string) {
        return this.http.post(this.phpServicePoint+'insertInTable.php?insertType='+insertType,jsonData)
               .map((response:Response) => response.json())
               .catch((error:any) => Observable.throw(error.json().error || 'Server error'));
    }

    public getAllListBySelectType(jsonData: any, selectType : string) {
        return this.http.post(this.phpServicePoint+'getAllList.php?selectType='+selectType,jsonData)
               .map((response:Response) => response.json())
               .catch((error:any) => Observable.throw(error.json().error || 'Server error'));
    }

    public actionOnDataByUpdateType(jsonData: any,updateType : string) {
        return this.http.post(this.phpServicePoint+'updateInTable.php?updateType='+updateType,jsonData)
               .map((response:Response) => response.json())
               .catch((error:any) => Observable.throw(error.json().error || 'Server error'));
    }

    public downloadImage(img) {
        const imgUrl = img;
        const imgName = imgUrl.substr(imgUrl.lastIndexOf("/") + 1);
        this.httpClient
          .get(imgUrl, { responseType: "blob" as "json" })
          .subscribe((res: any) => {
            const file = new Blob([res], { type: res.type });
    
            // IE
            if (window.navigator && window.navigator.msSaveOrOpenBlob) {
              window.navigator.msSaveOrOpenBlob(file);
              return;
            }
    
            const blob = window.URL.createObjectURL(file);
            const link = document.createElement("a");
            link.href = blob;
            link.download = imgName;
    
            // Version link.click() to work at firefox
            link.dispatchEvent(
              new MouseEvent("click", {
                bubbles: true,
                cancelable: true,
                view: window
              })
            );
    
            setTimeout(() => {
              // firefox
              window.URL.revokeObjectURL(blob);
              link.remove();
            }, 100);
          });
      }
}