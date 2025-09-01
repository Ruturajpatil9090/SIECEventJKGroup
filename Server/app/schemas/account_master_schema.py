from pydantic import BaseModel
from typing import Optional
from decimal import Decimal

class AccountMasterBase(BaseModel):
    Ac_Code: Optional[int] = None
    Ac_Name_E: Optional[str] = None
    Ac_Name_R: Optional[str] = None
    Ac_type: Optional[str] = None
    Ac_rate: Optional[Decimal] = None
    Address_E: Optional[str] = None
    Address_R: Optional[str] = None
    City_Code: Optional[int] = None
    Pincode: Optional[str] = None
    Local_Lic_No: Optional[str] = None
    Tin_No: Optional[str] = None
    Cst_no: Optional[str] = None
    Gst_No: Optional[str] = None
    Email_Id: Optional[str] = None
    Email_Id_cc: Optional[str] = None
    Other_Narration: Optional[str] = None
    ECC_No: Optional[str] = None
    Bank_Name: Optional[str] = None
    Bank_Ac_No: Optional[str] = None
    Bank_Opening: Optional[Decimal] = None
    bank_Op_Drcr: Optional[str] = None
    Opening_Balance: Optional[Decimal] = None
    Drcr: Optional[str] = None
    Group_Code: Optional[int] = None
    Created_By: Optional[str] = None
    Modified_By: Optional[str] = None
    Short_Name: Optional[str] = None
    Commission: Optional[Decimal] = None
    carporate_party: Optional[str] = None
    referBy: Optional[str] = None
    OffPhone: Optional[str] = None
    Fax: Optional[str] = None
    CompanyPan: Optional[str] = None
    AC_Pan: Optional[str] = None
    Mobile_No: Optional[str] = None
    Is_Login: Optional[str] = None
    IFSC: Optional[str] = None
    FSSAI: Optional[str] = None
    Branch1OB: Optional[Decimal] = None
    Branch2OB: Optional[Decimal] = None
    Branch1Drcr: Optional[str] = None
    Branch2Drcr: Optional[str] = None
    Locked: Optional[bool] = None
    GSTStateCode: Optional[int] = None
    UnregisterGST: Optional[bool] = None
    Distance: Optional[Decimal] = None
    Bal_Limit: Optional[Decimal] = None
    bsid: Optional[int] = None
    cityid: Optional[int] = None
    whatsup_no: Optional[str] = None
    company_code: Optional[int] = None
    adhar_no: Optional[str] = None
    Limit_By: Optional[str] = None
    Tan_no: Optional[str] = None
    TDSApplicable: Optional[str] = None
    PurchaseTDSApplicable: Optional[str] = None
    PanLink: Optional[str] = None

class AccountMaster(AccountMasterBase):
    accoid: int

    class Config:
        from_attributes = True
        arbitrary_types_allowed = True