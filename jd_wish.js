/*

活动入口：京东众筹-众筹许愿池
短期活动

已支持IOS京东双账号,云端N个京东账号
脚本兼容: QuantumultX, Surge, Loon, JSBox, Node.js
注：会自动关注任务中的店铺跟商品，介意者勿使用。
=====================================Quantumult X=================================
[task_local]
10 10,15 13-20 3 * https://raw.githubusercontent.com/i-chenzhe/qx/main/z_wish.js, tag=众筹许愿池, enabled=true
=====================================Loon================================
[Script]
cron "10 10,15 13-20 3 *" script-path=https://raw.githubusercontent.com/i-chenzhe/qx/main/z_wish.js,tag=众筹许愿池
======================================Surge==========================
众筹许愿池 = type=cron,cronexp="10 10,15 13-20 3 *",wake-system=1,timeout=3600,script-path=https://raw.githubusercontent.com/i-chenzhe/qx/main/z_wish.js
====================================小火箭=============================
众筹许愿池 = type=cron,script-path=https://raw.githubusercontent.com/i-chenzhe/qx/main/z_wish.js, cronexpr="10 10,15 13-20 3 *", timeout=3600, enable=true
*/
const $ = new Env('众筹许愿池');
const notify = $.isNode() ? require('./sendNotify') : '';
const jdCookieNode = $.isNode() ? require('./jdCookie.js') : '';
const JD_API_HOST = 'https://api.m.jd.com/client.action/';
//Node.js用户请在jdCookie.js处填写京东ck;
//IOS等用户直接用NobyDa的jd cookie
let cookiesArr = [], cookie = '', message = '', assistList = [];
if ($.isNode()) {
    Object.keys(jdCookieNode).forEach((item) => {
        cookiesArr.push(jdCookieNode[item])
    })
    if (process.env.JD_DEBUG && process.env.JD_DEBUG === 'false') console.log = () => {
    };
} else {
    let cookiesData = $.getdata('CookiesJD') || "[]";
    cookiesData = JSON.parse(cookiesData);
    cookiesArr = cookiesData.map(item => item.cookie);
    cookiesArr.reverse();
    cookiesArr.push(...[$.getdata('CookieJD2'), $.getdata('CookieJD')]);
    cookiesArr.reverse();
    cookiesArr = cookiesArr.filter(item => item !== "" && item !== null && item !== undefined);
}
 var _0xodJ='jsjiami.com.v6',_0x13d1=[_0xodJ,'5b+x5YuT55eq5ouo56Sh5YmTw7U=','wpjDvg5Lw5R6w7sSag==','wrXCsMOiw7HClg==','PsKGwp0gDj0/Jm8=','RsKowrzDoCDDk1kw','ajjDtsK9UUx1wrnCtMK7w5rDqMKXwqEc','w511wpk=','N8Kbw4nCiMOS','XGDDmmzCrA==','bWZJwrHCp8O+SsKuNBfCtQ==','wqHCvifDocK1','EMKUw4XCnA==','W39gcGc=','csKXw7vCkw==','5LuA5LmK6LCw','w4jjgIfkuLXkuI/ot53ljK4=','Y2JXNTs=','wr9zw5lcPsOdGzo=','wosjw40fwrlcwoND','bcOEfcOiFxwswqXDnkd3w5jCrsK3RcOSM8KA','csO1fcOxOCo6wrbDiFBiw5Y=','wrluw45HA8KGWXBKwoDCj8ODw6RkwoJeH3FoYV4bPWU3w4bCicKaPG/CmMKzCHw=','w5ZgwpcuYSUuZ0HCosK9LxNXwqEEwrs=','OQDCuVp6w7LCogorMW59w7XCs15Aw5MEFQvCszDDlGDCvsKMNh/Dpz7CjABjw6sYw4JWScK7HgsBwqQLETB3bF3Ch8OywqrCjWnCtjzDiT0zWsOmw7knwrDDiMOdw5ZfwqsoDXFGw4sOXMKBLxF7w6AEwojDvsKdW1YnBkHDtcKhJMO9Zi8XwpfCmQpKScOEGsOeM8OJNAbCs8KqHcK8wogPwprDsFnCt1p7wq4vIzfCgTtNwpxSaGUEw47DosKuw7p7w64nesKHwrpQUSvCjMOEwqt2DMKuw4nClDnCo8OfwqPCvsK4wrA5wrDDix3Dt8OTHBlWG8KQXh/CmVjCi8OWQcKbwrAJQhPCg8KRRsOwPEpOLkopMsKnw6dvwr0jwpnDiGDCoBZFSFlfw7oLw7DCpcOXRmbCiRfDoAxGSxbCi1jDnGvCmHsPw71qw5jCoAE0w6Qpw6zCs8K4wqB6wo9wwo4eJ0tTwpDDtGZUw44iw54DfxxFWhN5wobDsQfDvkhsw4vDshg1Z8OcwpUYP8O6JkcHUcOPw51swqV+LjBywoZFLm3DuyXDksKbPgUkwqHCqjHCtcKlcQZvw5R/wo/CjcOAwoNNVwowFG7CiEMuw5hLXHvDp8O7w5LDqULCtG4rD1pVw7nCmh45fcOFwqhAw49CFcKQwo7CoQfDjhM/wpcHGMK9wqvCsBkNSEDDpn8cw5zDujcuwo80aWrCr8K+w5Uzw5hcPMOsGDDCm8K1QMOAJQ8Pw7EDA1PCtGbCj3XDoXg2w5vCn3fCtw==','wqHChsOfw4wT','QDVzw5HCgw==','GcOTTALCoA==','wrzCsxvDvcKE','X8OjwqbDiCTDmMOYTcOjw6M=','w6TCvjxETA==','wrPCogLDqMKcAsOlwpsuPhwBAydXwqHDs8KWI0Y0FW/CjsKWw65bYCdmdWw+wqXCksKyDsOyKzvDpzzDp0rCojvCvcOxw6LCv8OGwoQswqFBw4zDpSV+PRxUVMKcY8KlwqcMworDkyBswqnDmMK6w7LDtXrDnStEwogdUMOxwrA2wo0EUxkmUXfCgHYhwqfCnsO6wrwuIcKvKhPDncKRQsKswpPDkHESWcOiwr7CvcK6NsKecsO7w7M0wq1LEcK2U8OLPMK0GxLDtTPDsFkvw7LDunDCgcOzDcOtw53DgDbDo8ONDsOgHsKqDwjCmXzDpcOsa3AUAhPDgljCm8K+w5siwpzDnxPCjQwDwr12wpYJwocQwrdOw63Cuy/DicKLNMOJwq7Co8OdwqLDrcKa','wrglw4YOwoNUwoFIBAvCuQ==','w73CtBnDvMKWBQ==','NsKRw7bClMOew7fCn8OPw5Z1TTw6Ri5Kw4hxw5fDpHTDrsK5w4vDuQ4nw67Dh8KKwoI=','RGXDiijDlQ==','BDXCukFG','wq4/w5sZ','WMOpwqTDvXvDiw==','w6N7w6oNwpk=','FsOCAXc=','wpnDrBhSw5F2w6c=','wqw1cwIYcw==','IR7Doj7CuSDDjQ==','ZEXDlFfCisOFw5/Dug==','LMORSzQ=','WGPDssKCfsOv','f39WIhDCplVRBA==','wrByw6pmwpfCrQ==','w7jCs8O/YcKzw5DDkVXCuA==','Q8OBf1DDhmY=','EjJdw606w7TDsMOzwpFSwrN1F8KJ','acOWeVTDsw==','UMOnwrfDmQ==','w6F/w6sLwpDDqw==','w5LCiw9vXsKTw4I4QHrCmsOHPQnDq8KdGcOB','RQdsw4jClcOMwqdewq1tw7nCtMK9ZQ==','wrM6wrhe4peowr/mianliLnkubo=','dVfDhUQ=','OHtDFcOOwpzCtSPDn8OgXMKORDPDn1jDql8=','wq8lYRkAbkDCjw==','wqYPw5Al','ZcKBw7/Cj8O6w67CisKAw4VuO3s6QiJrw5Jq','esKww7/CnMOVw5jCnMKTw5N5LnU=','w4LCgB4=','cl4uw53DnQ==','w4jDv8Ovwqg=','w5fDrcKnwq3CjyLCrsKJwrl3wonCusKmwpFaw7bChz0=','wpNsD8Otwr4DwqrDu8KsCsK+w4E=','PH1HCcO7woLCoCg=','wqXClsOSw5LCnsOow4UaBA==','bhjDlDI=','OeODi+S5teS6jui1j+WNig==','ZsKowrzDoCfDnFI6','EeaImeWIvOS6o+S6quS6ieS5puinu++8puS9p+aZheaXqOawrOWJvOaWt+exvOWfge+8heivjeiEvOihv+afm+efuuaWleaPn+OAlgI=','YkLDg0zCrcOMw5DDsxc=','asOSa8OlOh8=','wrLCg8OUw5o=','NmQIw6Hil4PCl+WuouaKnOS7teWKlu++m+iMleW9qA==','wp1PHsOt','wrALw5cxKyQ=','HsOVIsOMHQ==','fTrDrcKu','WBV6w7XCscOBwphewqc=','wr/Cj8KGw44=','w7Fzw6I9wpPDu8Kx','w6HCr8O9','w5kOSsKs4peMYg==','X8Oqw7lnw5fChMO4KcKX','csKWwoJ4','wobDr8KYKQ==','w7piTcK5Sw==','wr/CtwLDuQ==','UHh+VnB7wr4=','XUgnw5XDthEDHQ==','WMOpwqQ=','QcKywpbCheKUg+WJvuWIuuasnOaUgeW1rueXsuWyqe++kg==','HsKew4M=','OMKXOMKw4pWKSw==','Rlk5w4zDnBkEHlQ=','A8O7w4zDqGTCsA==','5LmY5Lqa5p+m5Yuj5Zqk6L+U5Zis56uY5paC5o6V','FjxJw6c/w6g=','wqIqwqhP','5LmY5Lqa6Ly/5Zqc5LmK56m65paC5o+M','wojCscOo','wqHCvlvDu8KB','w7Rgw7EOw5DCv8KwbMKaVzUrXVoMw6tk','QAMyw6bCksOLw5lGwqYzw7/CqcKk','wrrDs8KYOMKN','wqvCokNvw74=','bMKZwrFDw5s=','GcKrw7bCp8OB','wrPCmsKGw58OwpfCgcOqUnRMDMOCdRYmTcKLw4PDjMKbfMKaaEIdVjd/fsKpR3RgwoLDmA3Cl8KFJ8K5XVtEwp/Cvw03WnzDvCLDrcOnwoEAw7vClg==','wrzCi8KG','w4DDscO8wozCsA8=','Q8OBeEbDhXYf','wrLCpTrDt8KIUcKk','GFx8EcO4','L8KUwowz','wrYxw5siwoBTwr5UIh/DoSURBw==','U0BuDxdKw7xq','wqRpw59FOcOSEDA=','VsOnwrDDnUDDl8OSSw==','woPDpAhSw6l4w7kF','XcOLaw==','ZmNUFTHCtw==','eCvDsMOhWTJ6wq/DlsK3w4HDsQ==','w7Jqw6gSwpXDvMK1fcKVVDpwUgVDw6c6wrVdw6vDgMKHw7DDiTsiBcOlw7nCicOTwoPCug==','w6Q0MGMqeh13wpU5w6tKQcKTw5zChG3CoFvDrMKvWzXCh8KcMsK2w6RgJMKhNMOZw4zCr3DCvx3DvSorwq5ywpxMwojDlMKkwqnCgkJ6fsKRBMKTa1pYfGFNW8K3w73DkMOiWsKiwp3Du8OmBhEgAGw7w7Aww5rDjsO9SRsidTU5wrNBfsOZOQ1uPCfCjAfDpsKMw4M/DmbCjsKsLsOXIcOVHcOtRcKna8ObZl7Dl2/DlMKAccObZHclw4fCpmLDtsKJw5cBw6pZwqUfSsKUw6zDlmYewpLDm8KOw5TCi2NUesOPSCPCkcOrw5skZ8KnwoTCnkvCqhjDjsOTe2vDiMK3w70OwqMTw6JTwphrw7wXNMKsw746AwrDpTrCk1pAw43DmcOnRiIDw6Z4dsO2esODw6xEKcKdREx1GcKpC8OaeEjCui7Dg0LDmQPDo8Krw7gWw6rDgsKoQknCksKFWykiwqbCn8OswoDCv8OGF0DDpGnDs8O0w6jCmVoYw4RjQFw3woHCqGVkwrFFw7DDh1XDszTCmMKSF8Ksw73CgMKWUhbDjMOgbjbDhzDCmMKqwp8=','a17CnEbCrQ==','wrrCnsKCw4MUw47Dj8KxU3RPRsKGa1ci','wrluw45HA8KGWXBJwpXCh8KDwqcnw4ZQVTxkYxxX','dTTDvg==','6IWo5p+d54us5p+ewqVtS8O9ZBjmm6rml6TmlJHplr5Vw7TCnVzDm8OXUcO5EcOPfnh4ExPCg8OqBuS4n+W5re++hcOiPDNFX8OXwpkTXjwPYjDDksKFwpjDuMOPw6/Cl8OpHMKow4YXw5oDG3JCwotYw4TDglg=','wrbCncKV','w6AxPHY=','44O65oy256WM44Cn6K2y5Yak6I2k5Y6l5Lqb5Lm36LaO5Yyr5LiIwqPConFqNmRA55mC5o6y5LyH55eUPsO+W8O6w4LDq+eZsuS4geS5vOetm+WJtOiOi+WOoQ==','wonCtsKcw5ol','WFRdJRs=','IHPDt3fClMOSw54=','RmPDr8KQZsOz','eBV6w7XCrMODwppJ','ecKcw77CmMOD','dRFnw5bCow==','wrcjTBgTblo=','FDpNw4kDw7vDjcOk','Slxs','wqoxKMOeGcOGw4rlvq/lpb/jgJXku4rkurXot57ljZw=','wrjCi8ODw5DCvsOuw4EZ','wrjDvg5Lw4l4w7kF','OxzCmw/DqcKBwpPCv0TCtA==','wpBdJsOjwrcrwrM=','w5xpwpk=','44CG5oyn56eM44CIw7RRw75MZCXlt4flp6vmlZ4=','5LiA5LqC6La95Yy+','wrLCgMKWw4oF','XcKywrrDuSfDnFI6','w7nDrcO+wrvCjBzDlMOY','YnhHIDDDvxUMA8OIwoHCiXQ/bx7DmMONGB3CqD4=','w4XDrcOVwqbCphg=','FDJDw4c=','5Lqx5LiV6Lae5Y6l','JGZCAsO3','eOitlOmGuOaWpueasuW/jOiOo+WMkgF8wpNlw7rDig==','XgNrw6PCg8OWwpY=','wpjCgcKdw4QUw4jDpMKB','wqFZEsOdwpE=','wpTCl2E=','w4rDqsK2wq/CvW/DoMOUwrx0wqPDtcK3w4tNw5PCinwlRsO9E8KYb8KdTWBbwpRzAl3CsgbCg1DDtcKI','ScKfwrjDpgg=','wq4xw5oewpI=','PcO0cC3Cnw==','w7tuw6wOwo/CpcO7JsKdSz1xVVhGw604w7ZGw6PCl8KQwrPDkDItGMKlwrTDisKNw4XDvwA=','DcObw7XDtW4=','wqMew5QoLjMMwoMHw5ACwoDDlgbDuMO9w6xjw7DDgsOtwrzDtcOGScKMY31uw6/Dlj7CsA==','asKnw6PCh8O3','wp/Do8KOMsOhYcKew4vChMKe','wrgqThU+','wrcWw6YwJA==','w6RjR8KYew==','wozCkxhVw7HChcK8HX4PwpXCv33CtMKdbGg8ZAjDj0ILwpkCwrdbw6zDosOzw4vDlkJEJ0geLRzCgz/DqFMrwobCgA==','wohHw7hXwq0=','Vlx4CQ==','KTbCvVk=','w7HDtsKzwp3CoA==','XUlhUV0=','wpFaHsO8wqN4w7LCtcK/HsKBwoDCjsOyccKxRnlDwod7wrccwpPDpBDCkjc9VyzDg8OBw4pwWxo=','wpjDpcKeLMKB','wq7CsxfDtcKf','AsOMBmI=','e2XDoXbCkg==','aGpRFBI=','wpDDp8KfIw==','woHDqAVew7Nx','asK2w7vCicOa','w6Bqw7QXwog=','WGlA','Y8OBfw==','wrEaw4UwMiM=','wqHCqsKTw5sc','ciVcwqA=','wpXDpcKfMcKFRA==','woPDp8KCNg==','cD3DgSfCmA==','MgfCrGNO','bH7DksKWdA==','wpUcw4wuwrs=','X8OFYUA=','wpnDtcKM','w4HDv8K2wrzCpg==','W0wmw4A=','GQ3lpbrotoDCk17lj7LlmpgXcw==','wr3Ch8Kcw44Rw4HDlw==','CcO3w5fDiWPCv8OYeRDDpcKFw7PCqRfDnxNNwqktcEQQ','5Y2t5omf5ae2','JGZSAsO9worCtyXDpMOnesKCVzfDm2jDu28NdgU0w6FUJxkYwrPCpBRpwqouwqQ=','wrw1YRk=','wrI/w48=','SUHDvB7Dug==','UMOdwobChsOkaBDChz95ezrDhXBNw6TCgUzCicKSAMKkUsKbJhEsARPCgcKi','QHh3fg==','wrYPw5cvET8e','DjJdw4kZw6PDkMOk','TsO3w5hhw7g=','w4V7wo01GWohZ0k=','w4DDscO8','E8Kew5LCvsOk','YnnDuMK/RFV0w6nDgsO2','wrrCnsKCw6YZ','d1PCsyHCjjzDlR/CkDzCo8KBw5XCvlM=','DsKywql6w5jCkMO6BsKKwpjDjw==','XsKBFHXCvcOwe8KqNmrCjGvCscKVF0TDvyI=','wq/CtwXDs8KhWcKnw5E=','e8Okw6J8w64=','WcOnwrvDrGDDlMORVw==','wq/CvxvDvcKc','wqJyw5VHAMOVGDhqwpPCksKEw78jwpxDZ310','wpnCkhdCw7DCnw==','fMKdw70=','cTrDq8KiW3JpwpTCm8K7w4LDsMKXwrARf29nw6fCug==','ZMKTw6nClsOvw7bCgMKXw48=','woDCssOgwqvCrybCpMKywrkmw7A=','w5bDv8KxwrTChzE=','eitP','wq/Cj8KBw4Qzw4zDg8Kg','w53CkDtkRQ==','BjXCkGR+','dDrDocKbXXF1wrg=','DjpDw4c+','ZcKDwpdtw6JN','w4vDsMOxwqzChA==','QsOUYEzDng==','BcOCHGI=','wq4Bw4M=','w4/CpMO3X8KW','wrlMw4U0NxkJw5VUwp0=','w7nDulTDrMKOS8Khw6ApYFcCD3cR','PyXCmibDk3jCr8KbcG51','P8KUwos5FDo=','GMKkwqLDm33DkMObSsOBw78FdMOZUEzDmAPCvQ==','wqkxaQM=','IsKHw5TCu8OA','wrV2w7Bnwr/CrEDDnMOcwoEDMw==','RcK1woxLw74=','cEbDgWzCpw==','w7nCocOpeMK0w5zDlULCsw==','5baT57md5ay65oq15omX5p+e','wofCk2Zsw77DhHJc','wrYHw4khNA==','wpzDo8KHMsKIb8Kcw4c=','DMO1w7PDsW0=','cWzDljXDhmM=','wrPCi8Kew585w4LDgMKg','fhjDkzjCt2XDh8KM','PsO0N8OsEQ==','Ym1BPSzCq0N8AsOCwozCiz8xNSfDn8KMCRc=','S3bDscK+dg==','UMKPV2LCqMOqf8KQDXjCmWDCscKVFw==','Z8KTw7PCiQ==','AcOZKg==','wrIbw5cs','YiVbwqrCg8OYRcOpYA==','wr7Ch8OBw5fChMOnw5U4HHXCnMKNIHfDrcO2Wl3CsMOYwpZb','UMKPV2LCqMOqf8KQDXjCmWDCscKVF1bDsX3ChAs5w4DCg8KZw7XDh8K0fcKhfj8=','IWdB','Qwjsrzljuihamiy.czwSoymP.v6kn=='];(function(_0x4b5f07,_0x202cb9,_0x95c540){var _0x3d7fc6=function(_0x351ab5,_0x3cd80a,_0x1d821c,_0x3ed97e,_0x1ebbe2){_0x3cd80a=_0x3cd80a>>0x8,_0x1ebbe2='po';var _0x22283a='shift',_0x1cc459='push';if(_0x3cd80a<_0x351ab5){while(--_0x351ab5){_0x3ed97e=_0x4b5f07[_0x22283a]();if(_0x3cd80a===_0x351ab5){_0x3cd80a=_0x3ed97e;_0x1d821c=_0x4b5f07[_0x1ebbe2+'p']()}else if(_0x3cd80a&&_0x1d821c['replace'](/[QwrzluhyzwSyPkn=]/g,'')===_0x3cd80a){_0x4b5f07[_0x1cc459](_0x3ed97e)}}_0x4b5f07[_0x1cc459](_0x4b5f07[_0x22283a]())}return 0x77fc5};return _0x3d7fc6(++_0x202cb9,_0x95c540)>>_0x202cb9^_0x95c540}(_0x13d1,0x19b,0x19b00));var _0xf278=function(_0x22c0ca,_0x16af17){_0x22c0ca=~~'0x'['concat'](_0x22c0ca);var _0x527726=_0x13d1[_0x22c0ca];if(_0xf278['GwmNJr']===undefined){(function(){var _0x2cbf4=typeof window!=='undefined'?window:typeof process==='object'&&typeof require==='function'&&typeof global==='object'?global:this;var _0x2077b6='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';_0x2cbf4['atob']||(_0x2cbf4['atob']=function(_0x51c842){var _0x34ae9a=String(_0x51c842)['replace'](/=+$/,'');for(var _0x160b33=0x0,_0x207320,_0x268f04,_0x1ddb13=0x0,_0x3858d6='';_0x268f04=_0x34ae9a['charAt'](_0x1ddb13++);~_0x268f04&&(_0x207320=_0x160b33%0x4?_0x207320*0x40+_0x268f04:_0x268f04,_0x160b33++%0x4)?_0x3858d6+=String['fromCharCode'](0xff&_0x207320>>(-0x2*_0x160b33&0x6)):0x0){_0x268f04=_0x2077b6['indexOf'](_0x268f04)}return _0x3858d6})}());var _0x1884d3=function(_0x2087d9,_0x16af17){var _0xa09a2e=[],_0x1b89b4=0x0,_0x1e033c,_0x1edf97='',_0x33ddcf='';_0x2087d9=atob(_0x2087d9);for(var _0xa43a5e=0x0,_0x3c6cdd=_0x2087d9['length'];_0xa43a5e<_0x3c6cdd;_0xa43a5e++){_0x33ddcf+='%'+('00'+_0x2087d9['charCodeAt'](_0xa43a5e)['toString'](0x10))['slice'](-0x2)}_0x2087d9=decodeURIComponent(_0x33ddcf);for(var _0x31412e=0x0;_0x31412e<0x100;_0x31412e++){_0xa09a2e[_0x31412e]=_0x31412e}for(_0x31412e=0x0;_0x31412e<0x100;_0x31412e++){_0x1b89b4=(_0x1b89b4+_0xa09a2e[_0x31412e]+_0x16af17['charCodeAt'](_0x31412e%_0x16af17['length']))%0x100;_0x1e033c=_0xa09a2e[_0x31412e];_0xa09a2e[_0x31412e]=_0xa09a2e[_0x1b89b4];_0xa09a2e[_0x1b89b4]=_0x1e033c}_0x31412e=0x0;_0x1b89b4=0x0;for(var _0x4de4d3=0x0;_0x4de4d3<_0x2087d9['length'];_0x4de4d3++){_0x31412e=(_0x31412e+0x1)%0x100;_0x1b89b4=(_0x1b89b4+_0xa09a2e[_0x31412e])%0x100;_0x1e033c=_0xa09a2e[_0x31412e];_0xa09a2e[_0x31412e]=_0xa09a2e[_0x1b89b4];_0xa09a2e[_0x1b89b4]=_0x1e033c;_0x1edf97+=String['fromCharCode'](_0x2087d9['charCodeAt'](_0x4de4d3)^_0xa09a2e[(_0xa09a2e[_0x31412e]+_0xa09a2e[_0x1b89b4])%0x100])}return _0x1edf97};_0xf278['RkoawB']=_0x1884d3;_0xf278['KuLAqS']={};_0xf278['GwmNJr']=!![]}var _0x3b4488=_0xf278['KuLAqS'][_0x22c0ca];if(_0x3b4488===undefined){if(_0xf278['yuhRcl']===undefined){_0xf278['yuhRcl']=!![]}_0x527726=_0xf278['RkoawB'](_0x527726,_0x16af17);_0xf278['KuLAqS'][_0x22c0ca]=_0x527726}else{_0x527726=_0x3b4488}return _0x527726};!(async()=>{var _0x1a63e3={'uDOxG':function(_0x166ea8){return _0x166ea8()},'lICPy':_0xf278('0','I)aw'),'zUyzL':'https://h5.m.jd.com','QxSwE':'gzip,\x20deflate,\x20br','fzNbJ':_0xf278('1','yg#*'),'uxBtc':_0xf278('2','434I'),'DxElH':_0xf278('3','[5ux'),'oXeDB':function(_0x1bb7cd){return _0x1bb7cd()},'lcunM':_0xf278('4','@8tq'),'RXnuX':_0xf278('5','#A)!'),'bzrKr':function(_0x464eb9,_0x1fd564){return _0x464eb9<_0x1fd564},'aKAeX':function(_0x512589,_0x3c3a67){return _0x512589(_0x3c3a67)},'XwxQA':function(_0x435aa1,_0x51dc05){return _0x435aa1+_0x51dc05},'afXNH':function(_0x53bcad){return _0x53bcad()},'bfbDQ':function(_0x1bfdb6,_0xcf0eb4){return _0x1bfdb6!==_0xcf0eb4},'IcJvj':function(_0x8c9a36,_0xf314f6){return _0x8c9a36===_0xf314f6},'qoBJm':function(_0x1de217,_0x1f4e96,_0xc730e0){return _0x1de217(_0x1f4e96,_0xc730e0)},'FxSaf':function(_0x129a42,_0x38110e,_0x13e54b){return _0x129a42(_0x38110e,_0x13e54b)},'KLdCL':function(_0x4f9ece){return _0x4f9ece()},'iihon':'有点东西进账'};$[_0xf278('6','I)aw')](_0xf278('7','*zDv'));if(!cookiesArr[0x0]){$[_0xf278('8','@8tq')]($[_0xf278('9','434I')],_0xf278('a','4VQ0'),_0x1a63e3[_0xf278('b','@8tq')],{'open-url':_0x1a63e3[_0xf278('c','9jx&')]});return}$['appId']=_0xf278('d','[5ux');for(let _0x50b253=0x0;_0x1a63e3['bzrKr'](_0x50b253,cookiesArr[_0xf278('e','!$[(')]);_0x50b253++){if(cookiesArr[_0x50b253]){cookie=cookiesArr[_0x50b253];$[_0xf278('f','9XOE')]=_0x1a63e3['aKAeX'](decodeURIComponent,cookie['match'](/pt_pin=(.+?);/)&&cookie['match'](/pt_pin=(.+?);/)[0x1]);$[_0xf278('10','!e[!')]=_0x1a63e3[_0xf278('11','9XOE')](_0x50b253,0x1);$[_0xf278('12','PWhk')]=!![];$[_0xf278('13','Ffmj')]='';await _0x1a63e3['oXeDB'](checkCookie);console[_0xf278('14','hD22')](_0xf278('15','$%@x')+$['index']+'】'+($[_0xf278('16','a8#N')]||$[_0xf278('17','h%Q[')])+_0xf278('18','[5ux'));if(!$[_0xf278('19','I*@o')]){$[_0xf278('1a',']^Y$')]($['name'],_0xf278('1b','4zde'),_0xf278('1c','Tblf')+$[_0xf278('1d','@8tq')]+'\x20'+($[_0xf278('1e','lfUr')]||$[_0xf278('1f','Tblf')])+'\x0a请重新登录获取\x0ahttps://bean.m.jd.com/',{'open-url':_0xf278('20','9jx&')});if($[_0xf278('21','Tblf')]()){await notify['sendNotify']($[_0xf278('22','Ffmj')]+'cookie已失效\x20-\x20'+$[_0xf278('17','h%Q[')],_0xf278('23','*NSn')+$[_0xf278('24','4j]F')]+'\x20'+$['UserName']+_0xf278('25','uFam'))}else{$[_0xf278('26','9XOE')]('',_0xf278('27','@8tq')+(_0x50b253?_0x1a63e3[_0xf278('28','I*@o')](_0x50b253,0x1):''))}continue}await _0x1a63e3[_0xf278('50','LvQg')](wish)}}if(_0x1a63e3['bfbDQ'](message,'')){if($['isNode']()){await notify['sendNotify']($[_0xf278('51','i2mX')],message)}else{$[_0xf278('52','9iu3')]($['name'],_0x1a63e3['iihon'],message)}}})()[_0xf278('53','YyVT')](_0x503673=>{$['log']('','❌\x20'+$[_0xf278('54','(Lc(')]+_0xf278('55','(Lc(')+_0x503673+'!','')})[_0xf278('56','@8tq')](()=>{$['done']()});async function wish(){var _0x4a0b87={'PrAwE':'获取活动信息','THDLH':function(_0x332b39,_0x46e01c,_0x27519b){return _0x332b39(_0x46e01c,_0x27519b)},'Rtgwd':_0xf278('57','p1UR'),'biSoA':function(_0x4f8f4a,_0x47d42d){return _0x4f8f4a-_0x47d42d},'BdmLv':function(_0x21d257,_0x38afc6,_0x2609e6){return _0x21d257(_0x38afc6,_0x2609e6)},'aovLa':'harmony_collectScore','WzirW':function(_0x84f75b,_0x1eb665){return _0x84f75b>_0x1eb665},'zhQyZ':function(_0xeec3a,_0x185675){return _0xeec3a>_0x185675},'UQHNt':function(_0x9ed6e9,_0x49c452){return _0x9ed6e9-_0x49c452},'gnjeF':'1|2|3|4|0','PvpIE':function(_0x5505ef,_0x36d588){return _0x5505ef*_0x36d588},'SBzRi':function(_0x449e92,_0x21d2c8,_0x20b25a){return _0x449e92(_0x21d2c8,_0x20b25a)},'DemHJ':function(_0x1b4822,_0x41d757){return _0x1b4822-_0x41d757},'mgETz':function(_0x498705,_0x5a13a9){return _0x498705<_0x5a13a9},'hjamC':'添加助力码到本地助力池','cRBJf':function(_0x5ceffc,_0x4614ab){return _0x5ceffc/_0x4614ab},'EjmzW':_0xf278('58','a8#N'),'MVkIo':_0xf278('59','4j]F')};$['risk']=![];$[_0xf278('5a','PWhk')]=0x0;$[_0xf278('5b','LvQg')](_0x4a0b87['PrAwE']);await _0x4a0b87[_0xf278('5c','*NSn')](doSomething,_0x4a0b87['Rtgwd'],'{\x22appId\x22:\x22'+$['appId']+_0xf278('5d','*zDv'));if(!$[_0xf278('5e','3jOg')]){if($[_0xf278('5f','lzc#')]){for(const _0x4faad1 of $['taskVos']){switch(_0x4faad1[_0xf278('60','Ffmj')]){case 0xd:if(_0x4a0b87[_0xf278('61','Q5z)')](_0x4faad1['maxTimes'],_0x4faad1['times'])>0x0){taskToken=_0x4faad1['simpleRecordInfoVo'][_0xf278('62',']^Y$')];$[_0xf278('63','Tblf')]('执行'+_0x4faad1['taskName']);await _0x4a0b87['BdmLv'](doSomething,_0x4a0b87[_0xf278('64','*zDv')],_0xf278('65','I)aw')+$[_0xf278('66','@8tq')]+_0xf278('67','2s#5')+taskToken+_0xf278('68','Q5z)')+_0x4faad1['taskId']+_0xf278('69','uFam'));await $['wait'](0x3e8)}else{$['log']('已经完成所有'+_0x4faad1[_0xf278('6a','2eS4')]+'任务')}break;case 0x1a:if(_0x4a0b87[_0xf278('6b','Q5z)')](_0x4a0b87['biSoA'](_0x4faad1[_0xf278('6c','a!Pm')],_0x4faad1[_0xf278('6d','2eS4')]),0x0)){taskTokenList=_0x4faad1[_0xf278('6e','#A)!')]['filter'](_0x1cd623=>_0x1cd623[_0xf278('6f','4VQ0')]===0x1);for(const _0x1a7204 of taskTokenList){$[_0xf278('70','!e[!')]('执行'+_0x4faad1['taskName']);await doSomething(_0xf278('71','I)aw'),'{\x22appId\x22:\x22'+$['appId']+'\x22,\x22taskToken\x22:\x22'+_0x1a7204[_0xf278('72','!e[!')]+_0xf278('73','YyVT')+_0x4faad1[_0xf278('74','YyVT')]+',\x22actionType\x22:\x220\x22}');await $['wait'](0x3e8)}}else{$[_0xf278('75','i7mS')]('已经完成所有'+_0x4faad1[_0xf278('76','@8tq')]+'任务')}break;case 0x8:if(_0x4a0b87[_0xf278('77','lE3Q')](_0x4a0b87[_0xf278('78','l5%K')](_0x4faad1[_0xf278('79','I)aw')],_0x4faad1[_0xf278('7a','Ffmj')]),0x0)){taskTokenList=_0x4faad1['productInfoVos']['filter'](_0x56076e=>_0x56076e[_0xf278('7b','4zde')]===0x1);for(const _0x1c74c8 of taskTokenList){var _0x411a3d=_0x4a0b87[_0xf278('7c','Tblf')][_0xf278('7d','i2mX')]('|'),_0x11bc5c=0x0;while(!![]){switch(_0x411a3d[_0x11bc5c++]){case'0':await $[_0xf278('7e','uFam')](0x3e8);continue;case'1':$[_0xf278('7f','lzc#')]('执行'+_0x4faad1['taskName']);continue;case'2':await _0x4a0b87[_0xf278('80','N9dH')](doSomething,_0x4a0b87['aovLa'],_0xf278('81','lzc#')+$['appId']+_0xf278('82','2eS4')+_0x1c74c8['taskToken']+_0xf278('83','*NSn')+_0x4faad1[_0xf278('84','TEfe')]+_0xf278('85','a!Pm'));continue;case'3':await $[_0xf278('86','PWhk')](_0x4a0b87[_0xf278('87','*zDv')](0x3e8,_0x4faad1[_0xf278('88',']vX0')]));continue;case'4':await _0x4a0b87[_0xf278('89','4zde')](doSomething,'harmony_collectScore','{\x22appId\x22:\x22'+$[_0xf278('8a','[5ux')]+'\x22,\x22taskToken\x22:\x22'+_0x1c74c8[_0xf278('8b','N9dH')]+'\x22,\x22taskId\x22:'+_0x4faad1['taskId']+',\x22actionType\x22:\x220\x22}');continue}break}}}else{$['log'](_0xf278('8c','p1UR')+_0x4faad1[_0xf278('8d',']@6M')]+'任务')}break;case 0xe:if(_0x4a0b87['DemHJ'](_0x4faad1['maxTimes'],_0x4faad1[_0xf278('8e','lzc#')])>0x0){$[_0xf278('8f','9iu3')]=![];for(let _0x404783=0x0;_0x4a0b87[_0xf278('90','p1UR')](_0x404783,assistList[_0xf278('91','*NSn')]);_0x404783++){if(!$[_0xf278('92','@8tq')]){$['log']('执行'+_0x4faad1[_0xf278('93','W%Ww')]);await _0x4a0b87[_0xf278('94','*[RT')](doSomething,_0xf278('95','9jx&'),'{\x22appId\x22:\x22'+$[_0xf278('96','!$[(')]+_0xf278('97','uFam')+assistList[_0x404783]+'\x22,\x22taskId\x22:'+_0x4faad1['taskId']+',\x22actionType\x22:\x220\x22}');await $[_0xf278('98','!e[!')](0x7d0)}}}else{$[_0xf278('99','*[RT')]('已经完成所有'+_0x4faad1['taskName']+'任务')}$[_0xf278('75','i7mS')](_0x4a0b87['hjamC']);assistList[_0xf278('9a','lzc#')](_0x4faad1['assistTaskDetailVo'][_0xf278('9b','i7mS')]);break;default:break}}}await doSomething(_0xf278('9c','a8#N'),'{\x22appId\x22:\x22'+$['appId']+_0xf278('9d','uFam'));if($['userScore']){$[_0xf278('9e','4j]F')](_0xf278('9f','YyVT')+$[_0xf278('a0','h%Q[')]);for(let _0x58b60c=0x0;_0x4a0b87['mgETz'](_0x58b60c,parseInt(_0x4a0b87[_0xf278('a1','a8#N')]($[_0xf278('a2','TEfe')],$[_0xf278('a3','lfUr')][_0xf278('a4','I)aw')])));_0x58b60c++){$[_0xf278('a5',']^Y$')](_0x4a0b87[_0xf278('a6','*zDv')]);await _0x4a0b87['SBzRi'](doSomething,_0x4a0b87[_0xf278('a7','[5ux')],_0xf278('a8','i7mS')+$['appId']+'\x22}');await $[_0xf278('98','!e[!')](0x3e8)}}if(_0x4a0b87[_0xf278('a9','2eS4')]($[_0xf278('aa','*zDv')],0x0)){message+='\x0a【京东账号'+$[_0xf278('ab','3jOg')]+'】'+($[_0xf278('13','Ffmj')]||$['UserName'])+'\x20\x0a\x20\x20\x20\x20└获得'+$[_0xf278('ac','!e[!')]+_0xf278('ad','4VQ0')}}else{message+=_0xf278('ae',']vX0')+$[_0xf278('af','9jx&')]+'】'+($[_0xf278('b0','#A)!')]||$[_0xf278('b1','LvQg')])+'\x20\x0a\x20\x20\x20\x20└东哥说喜欢奶茶妹不喜欢你～'}}function doSomething(_0x393a31,_0x3dd26f){var _0xf4d4ac={'DVeou':_0xf278('57','p1UR'),'bLAMB':_0xf278('b2','YIrF'),'oYwkn':_0xf278('b3','YIrF'),'Ylrzg':function(_0x2ba4e4,_0x2c577f){return _0x2ba4e4(_0x2c577f)},'WQbkL':function(_0xb572aa,_0x22bdde){return _0xb572aa===_0x22bdde},'mSlVa':_0xf278('b4','#A)!'),'QcsWx':'application/x-www-form-urlencoded','gemek':_0xf278('b5',']^Y$'),'jtvsB':'application/json,\x20text/plain,\x20*/*','CFVYS':_0xf278('b6','l5%K'),'JxZUt':_0xf278('b7','@8tq')};let _0x483d2b={'url':_0xf4d4ac[_0xf278('b8','9XOE')],'headers':{'Content-Type':_0xf4d4ac[_0xf278('b9','YekF')],'Accept-Encoding':_0xf4d4ac[_0xf278('ba','2eS4')],'Cookie':cookie,'Connection':_0xf278('bb','a!Pm'),'Accept':_0xf4d4ac['jtvsB'],'User-Agent':_0xf4d4ac[_0xf278('bc','lE3Q')],'Referer':_0xf278('bd','2eS4'),'Accept-Language':_0xf4d4ac['JxZUt']},'body':_0xf278('be','LvQg')+_0x393a31+_0xf278('bf','2eS4')+_0x3dd26f+_0xf278('c0','!e[!')};return new Promise(_0x25c1a0=>{var _0x4d7ff7={'hFtbW':_0xf4d4ac['DVeou'],'XruqY':_0xf4d4ac['bLAMB'],'OQvTZ':_0xf4d4ac['oYwkn'],'Gsexo':function(_0x46d86d,_0x47f8f8){return _0xf4d4ac[_0xf278('c1','*NSn')](_0x46d86d,_0x47f8f8)},'sHRvD':'userScore','ZyOMx':function(_0x485326,_0x5e48f1){return _0xf4d4ac[_0xf278('c2','l5%K')](_0x485326,_0x5e48f1)}};$[_0xf278('c3','LvQg')](_0x483d2b,(_0x29637c,_0x346541,_0x3aefad)=>{try{if(_0x29637c){$[_0xf278('c4','a!Pm')](_0x29637c)}else{if(_0x3aefad){_0x3aefad=JSON[_0xf278('c5','yg#*')](_0x3aefad);if(_0x3aefad[_0xf278('c6','uFam')]['success']){switch(_0x393a31){case _0x4d7ff7['hFtbW']:$[_0xf278('c7','h%Q[')]=_0x3aefad['data'][_0xf278('c8','PWhk')][_0xf278('c9','2s#5')];$[_0xf278('ca','[5ux')]=_0x3aefad[_0xf278('cb','YekF')][_0xf278('cc','!$[(')]['userInfo'];$[_0xf278('cd','9jx&')]=_0x3aefad['data'][_0xf278('ce',']vX0')]['userInfo'][_0xf278('cf','N9dH')];break;case'interact_template_getLotteryResult':if(_0x3aefad['data'][_0xf278('d0','i2mX')][_0xf278('d1','Ffmj')](_0x4d7ff7[_0xf278('d2','i2mX')])){if(_0x3aefad[_0xf278('d3','a!Pm')][_0xf278('d4','yg#*')][_0xf278('d5','lE3Q')][_0xf278('d6','9XOE')](_0x4d7ff7['OQvTZ'])){$[_0xf278('5b','LvQg')](_0xf278('d7','yg#*')+_0x3aefad[_0xf278('d8','[5ux')]['result'][_0xf278('d9','4j]F')]['jBeanAwardVo'][_0xf278('da','PWhk')]+'个'+_0x3aefad[_0xf278('db','lzc#')]['result'][_0xf278('dc','!e[!')][_0xf278('dd','!e[!')][_0xf278('de','lE3Q')]);$['bean']+=_0x4d7ff7[_0xf278('df','(Lc(')](parseInt,_0x3aefad[_0xf278('e0','Tblf')]['result'][_0xf278('e1','YyVT')][_0xf278('e2','I*@o')][_0xf278('e3','4j]F')])}else{$[_0xf278('14','hD22')]('\x20\x20\x20\x20└\x20抽到了'+JSON[_0xf278('e4','a8#N')](_0x3aefad[_0xf278('e5','W%Ww')][_0xf278('d4','yg#*')]));message+=_0xf278('e6','lfUr')+$[_0xf278('ab','3jOg')]+'】'+($['nickName']||$[_0xf278('e7','lfUr')])+_0xf278('e8','i2mX')+JSON[_0xf278('e9','[5ux')](_0x3aefad['data'][_0xf278('ea','YIrF')])}}break;default:if(_0x3aefad[_0xf278('eb','a8#N')]['result']['hasOwnProperty']('score')){$['log'](_0xf278('ec','i7mS')+_0x3aefad[_0xf278('ed','I*@o')][_0xf278('ee','lzc#')][_0xf278('ef','*[RT')]+'积分')}if(_0x3aefad[_0xf278('f0','I)aw')]['result']['hasOwnProperty'](_0x4d7ff7['sHRvD'])){$['userScore']=_0x3aefad[_0xf278('e5','W%Ww')][_0xf278('d0','i2mX')][_0xf278('f1','9XOE')]}break}}else{if(_0x3aefad[_0xf278('f2','@8tq')][_0xf278('f3','yg#*')]===-0x3e9){$[_0xf278('f4','N9dH')](_0xf278('f5','I*@o')+JSON[_0xf278('f6','Q5z)')](_0x3aefad[_0xf278('f7','4zde')]['bizMsg'])+'\x0a\x20\x20\x20\x20└东哥说喜欢奶茶妹不喜欢你～');$[_0xf278('f8','9iu3')]=!![];return}else if(_0x4d7ff7[_0xf278('f9','$%@x')](_0x3aefad[_0xf278('fa','2eS4')][_0xf278('fb','3jOg')],0x68)){$[_0xf278('fc','(Lc(')]=!![];$[_0xf278('fd','a!Pm')](_0xf278('fe','p1UR'))}else{$[_0xf278('ff','*zDv')](_0xf278('100','YIrF')+JSON[_0xf278('101','(Lc(')](_0x3aefad[_0xf278('c6','uFam')][_0xf278('102','p1UR')]))}}}else{$['log'](_0xf278('103','9iu3'))}}}catch(_0x327373){$[_0xf278('104','Ffmj')](_0x327373,_0x346541)}finally{_0x25c1a0()}})})}function checkCookie(){var _0x16f128={'rOCxk':function(_0x25a544,_0x4119c4){return _0x25a544===_0x4119c4},'ingYK':_0xf278('105','yg#*'),'UTZvw':function(_0x173b06,_0x173fea){return _0x173b06===_0x173fea},'eJCdx':_0xf278('106','9iu3'),'HONSi':'https://me-api.jd.com/user_new/info/GetJDUserInfoUnion','NuszA':_0xf278('107','YyVT'),'XPVhN':'keep-alive','znGZL':'Mozilla/5.0\x20(iPhone;\x20CPU\x20iPhone\x20OS\x2014_3\x20like\x20Mac\x20OS\x20X)\x20AppleWebKit/605.1.15\x20(KHTML,\x20like\x20Gecko)\x20Version/14.0.2\x20Mobile/15E148\x20Safari/604.1','kZRUD':_0xf278('108','2eS4'),'YiHhW':_0xf278('109','yg#*')};const _0x1c70b2={'url':_0x16f128['HONSi'],'headers':{'Host':_0xf278('10a','9XOE'),'Accept':_0x16f128[_0xf278('10b','9iu3')],'Connection':_0x16f128[_0xf278('10c',']@6M')],'Cookie':cookie,'User-Agent':_0x16f128[_0xf278('10d','4zde')],'Accept-Language':_0x16f128[_0xf278('10e','*zDv')],'Referer':_0xf278('10f','@8tq'),'Accept-Encoding':_0x16f128['YiHhW']}};return new Promise(_0x4534d5=>{$[_0xf278('110','@8tq')](_0x1c70b2,(_0x2e6a57,_0x30d260,_0x2b99e7)=>{try{if(_0x2e6a57){$[_0xf278('111','Tblf')](_0x2e6a57)}else{if(_0x2b99e7){_0x2b99e7=JSON['parse'](_0x2b99e7);if(_0x16f128['rOCxk'](_0x2b99e7[_0xf278('112','i2mX')],_0x16f128['ingYK'])){$[_0xf278('113','2eS4')]=![];return}if(_0x16f128[_0xf278('114','4j]F')](_0x2b99e7['retcode'],'0')&&_0x2b99e7[_0xf278('115','TEfe')][_0xf278('116','LvQg')](_0xf278('117','hD22'))){$['nickName']=_0x2b99e7[_0xf278('4a','i7mS')][_0xf278('118','#A)!')][_0xf278('119','a!Pm')][_0xf278('11a','h%Q[')]}}else{$[_0xf278('11b','i2mX')](_0x16f128['eJCdx'])}}}catch(_0x1139b4){$[_0xf278('11c','9jx&')](_0x1139b4)}finally{_0x4534d5()}})})};_0xodJ='jsjiami.com.v6';
 // prettier-ignore
function Env(t, e) { class s { constructor(t) { this.env = t } send(t, e = "GET") { t = "string" == typeof t ? { url: t } : t; let s = this.get; return "POST" === e && (s = this.post), new Promise((e, i) => { s.call(this, t, (t, s, r) => { t ? i(t) : e(s) }) }) } get(t) { return this.send.call(this.env, t) } post(t) { return this.send.call(this.env, t, "POST") } } return new class { constructor(t, e) { this.name = t, this.http = new s(this), this.data = null, this.dataFile = "box.dat", this.logs = [], this.isMute = !1, this.isNeedRewrite = !1, this.logSeparator = "\n", this.startTime = (new Date).getTime(), Object.assign(this, e), this.log("", `🔔${this.name}, 开始!`) } isNode() { return "undefined" != typeof module && !!module.exports } isQuanX() { return "undefined" != typeof $task } isSurge() { return "undefined" != typeof $httpClient && "undefined" == typeof $loon } isLoon() { return "undefined" != typeof $loon } toObj(t, e = null) { try { return JSON.parse(t) } catch { return e } } toStr(t, e = null) { try { return JSON.stringify(t) } catch { return e } } getjson(t, e) { let s = e; const i = this.getdata(t); if (i) try { s = JSON.parse(this.getdata(t)) } catch { } return s } setjson(t, e) { try { return this.setdata(JSON.stringify(t), e) } catch { return !1 } } getScript(t) { return new Promise(e => { this.get({ url: t }, (t, s, i) => e(i)) }) } runScript(t, e) { return new Promise(s => { let i = this.getdata("@chavy_boxjs_userCfgs.httpapi"); i = i ? i.replace(/\n/g, "").trim() : i; let r = this.getdata("@chavy_boxjs_userCfgs.httpapi_timeout"); r = r ? 1 * r : 20, r = e && e.timeout ? e.timeout : r; const [o, h] = i.split("@"), n = { url: `http://${h}/v1/scripting/evaluate`, body: { script_text: t, mock_type: "cron", timeout: r }, headers: { "X-Key": o, Accept: "*/*" } }; this.post(n, (t, e, i) => s(i)) }).catch(t => this.logErr(t)) } loaddata() { if (!this.isNode()) return {}; { this.fs = this.fs ? this.fs : require("fs"), this.path = this.path ? this.path : require("path"); const t = this.path.resolve(this.dataFile), e = this.path.resolve(process.cwd(), this.dataFile), s = this.fs.existsSync(t), i = !s && this.fs.existsSync(e); if (!s && !i) return {}; { const i = s ? t : e; try { return JSON.parse(this.fs.readFileSync(i)) } catch (t) { return {} } } } } writedata() { if (this.isNode()) { this.fs = this.fs ? this.fs : require("fs"), this.path = this.path ? this.path : require("path"); const t = this.path.resolve(this.dataFile), e = this.path.resolve(process.cwd(), this.dataFile), s = this.fs.existsSync(t), i = !s && this.fs.existsSync(e), r = JSON.stringify(this.data); s ? this.fs.writeFileSync(t, r) : i ? this.fs.writeFileSync(e, r) : this.fs.writeFileSync(t, r) } } lodash_get(t, e, s) { const i = e.replace(/\[(\d+)\]/g, ".$1").split("."); let r = t; for (const t of i) if (r = Object(r)[t], void 0 === r) return s; return r } lodash_set(t, e, s) { return Object(t) !== t ? t : (Array.isArray(e) || (e = e.toString().match(/[^.[\]]+/g) || []), e.slice(0, -1).reduce((t, s, i) => Object(t[s]) === t[s] ? t[s] : t[s] = Math.abs(e[i + 1]) >> 0 == +e[i + 1] ? [] : {}, t)[e[e.length - 1]] = s, t) } getdata(t) { let e = this.getval(t); if (/^@/.test(t)) { const [, s, i] = /^@(.*?)\.(.*?)$/.exec(t), r = s ? this.getval(s) : ""; if (r) try { const t = JSON.parse(r); e = t ? this.lodash_get(t, i, "") : e } catch (t) { e = "" } } return e } setdata(t, e) { let s = !1; if (/^@/.test(e)) { const [, i, r] = /^@(.*?)\.(.*?)$/.exec(e), o = this.getval(i), h = i ? "null" === o ? null : o || "{}" : "{}"; try { const e = JSON.parse(h); this.lodash_set(e, r, t), s = this.setval(JSON.stringify(e), i) } catch (e) { const o = {}; this.lodash_set(o, r, t), s = this.setval(JSON.stringify(o), i) } } else s = this.setval(t, e); return s } getval(t) { return this.isSurge() || this.isLoon() ? $persistentStore.read(t) : this.isQuanX() ? $prefs.valueForKey(t) : this.isNode() ? (this.data = this.loaddata(), this.data[t]) : this.data && this.data[t] || null } setval(t, e) { return this.isSurge() || this.isLoon() ? $persistentStore.write(t, e) : this.isQuanX() ? $prefs.setValueForKey(t, e) : this.isNode() ? (this.data = this.loaddata(), this.data[e] = t, this.writedata(), !0) : this.data && this.data[e] || null } initGotEnv(t) { this.got = this.got ? this.got : require("got"), this.cktough = this.cktough ? this.cktough : require("tough-cookie"), this.ckjar = this.ckjar ? this.ckjar : new this.cktough.CookieJar, t && (t.headers = t.headers ? t.headers : {}, void 0 === t.headers.Cookie && void 0 === t.cookieJar && (t.cookieJar = this.ckjar)) } get(t, e = (() => { })) { t.headers && (delete t.headers["Content-Type"], delete t.headers["Content-Length"]), this.isSurge() || this.isLoon() ? (this.isSurge() && this.isNeedRewrite && (t.headers = t.headers || {}, Object.assign(t.headers, { "X-Surge-Skip-Scripting": !1 })), $httpClient.get(t, (t, s, i) => { !t && s && (s.body = i, s.statusCode = s.status), e(t, s, i) })) : this.isQuanX() ? (this.isNeedRewrite && (t.opts = t.opts || {}, Object.assign(t.opts, { hints: !1 })), $task.fetch(t).then(t => { const { statusCode: s, statusCode: i, headers: r, body: o } = t; e(null, { status: s, statusCode: i, headers: r, body: o }, o) }, t => e(t))) : this.isNode() && (this.initGotEnv(t), this.got(t).on("redirect", (t, e) => { try { if (t.headers["set-cookie"]) { const s = t.headers["set-cookie"].map(this.cktough.Cookie.parse).toString(); s && this.ckjar.setCookieSync(s, null), e.cookieJar = this.ckjar } } catch (t) { this.logErr(t) } }).then(t => { const { statusCode: s, statusCode: i, headers: r, body: o } = t; e(null, { status: s, statusCode: i, headers: r, body: o }, o) }, t => { const { message: s, response: i } = t; e(s, i, i && i.body) })) } post(t, e = (() => { })) { if (t.body && t.headers && !t.headers["Content-Type"] && (t.headers["Content-Type"] = "application/x-www-form-urlencoded"), t.headers && delete t.headers["Content-Length"], this.isSurge() || this.isLoon()) this.isSurge() && this.isNeedRewrite && (t.headers = t.headers || {}, Object.assign(t.headers, { "X-Surge-Skip-Scripting": !1 })), $httpClient.post(t, (t, s, i) => { !t && s && (s.body = i, s.statusCode = s.status), e(t, s, i) }); else if (this.isQuanX()) t.method = "POST", this.isNeedRewrite && (t.opts = t.opts || {}, Object.assign(t.opts, { hints: !1 })), $task.fetch(t).then(t => { const { statusCode: s, statusCode: i, headers: r, body: o } = t; e(null, { status: s, statusCode: i, headers: r, body: o }, o) }, t => e(t)); else if (this.isNode()) { this.initGotEnv(t); const { url: s, ...i } = t; this.got.post(s, i).then(t => { const { statusCode: s, statusCode: i, headers: r, body: o } = t; e(null, { status: s, statusCode: i, headers: r, body: o }, o) }, t => { const { message: s, response: i } = t; e(s, i, i && i.body) }) } } time(t, e = null) { const s = e ? new Date(e) : new Date; let i = { "M+": s.getMonth() + 1, "d+": s.getDate(), "H+": s.getHours(), "m+": s.getMinutes(), "s+": s.getSeconds(), "q+": Math.floor((s.getMonth() + 3) / 3), S: s.getMilliseconds() }; /(y+)/.test(t) && (t = t.replace(RegExp.$1, (s.getFullYear() + "").substr(4 - RegExp.$1.length))); for (let e in i) new RegExp("(" + e + ")").test(t) && (t = t.replace(RegExp.$1, 1 == RegExp.$1.length ? i[e] : ("00" + i[e]).substr(("" + i[e]).length))); return t } msg(e = t, s = "", i = "", r) { const o = t => { if (!t) return t; if ("string" == typeof t) return this.isLoon() ? t : this.isQuanX() ? { "open-url": t } : this.isSurge() ? { url: t } : void 0; if ("object" == typeof t) { if (this.isLoon()) { let e = t.openUrl || t.url || t["open-url"], s = t.mediaUrl || t["media-url"]; return { openUrl: e, mediaUrl: s } } if (this.isQuanX()) { let e = t["open-url"] || t.url || t.openUrl, s = t["media-url"] || t.mediaUrl; return { "open-url": e, "media-url": s } } if (this.isSurge()) { let e = t.url || t.openUrl || t["open-url"]; return { url: e } } } }; if (this.isMute || (this.isSurge() || this.isLoon() ? $notification.post(e, s, i, o(r)) : this.isQuanX() && $notify(e, s, i, o(r))), !this.isMuteLog) { let t = ["", "==============📣系统通知📣=============="]; t.push(e), s && t.push(s), i && t.push(i), console.log(t.join("\n")), this.logs = this.logs.concat(t) } } log(...t) { t.length > 0 && (this.logs = [...this.logs, ...t]), console.log(t.join(this.logSeparator)) } logErr(t, e) { const s = !this.isSurge() && !this.isQuanX() && !this.isLoon(); s ? this.log("", `❗️${this.name}, 错误!`, t.stack) : this.log("", `❗️${this.name}, 错误!`, t) } wait(t) { return new Promise(e => setTimeout(e, t)) } done(t = {}) { const e = (new Date).getTime(), s = (e - this.startTime) / 1e3; this.log("", `🔔${this.name}, 结束! 🕛 ${s} 秒`), this.log(), (this.isSurge() || this.isQuanX() || this.isLoon()) && $done(t) } }(t, e) }
