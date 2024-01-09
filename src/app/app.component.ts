import { Component } from '@angular/core';
import * as XLSX from 'xlsx';
import * as dayjs from 'dayjs';
import { PASSWORDRULE } from './password-rule';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  title = 'password-generator';
  arrayBuffer: any;
  matrix: any;
  numberRule: any;
  rule: any;
  dateRule: string[];
  data: [];
  readonly RULE = PASSWORDRULE;

  testData = {
    firstname: 'hung',
    lastname: 'dang',
    birthday: '04-22-2001',
    address: 'Ha Noi',
    hobby: 'game',
    childrenName: 'child',
    wifeName: 'wife',
    job: 'it',
  };

  constructor() {
    this.matrix = this.RULE.matrix;
    this.numberRule = this.RULE.numberRule;
    this.rule = this.RULE.rule;
    this.dateRule = this.RULE.datePosition;
  }

  createFile(e) {
    e.preventDefault();
    const convertData = JSON.stringify(this.data.flat().flat())
      .replaceAll('","', '"\n"')
      .replaceAll('[', '')
      .replaceAll(']', '')
      .replaceAll('"', '');
    const blob = new Blob([convertData], { type: 'application/json' });
    const element = document.createElement('a');
    element.href = window.URL.createObjectURL(blob);
    element.download = 'password.txt';
    element.click();
  }

  async onImportExcel(event: any) {
    /* wire up file reader */
    const file = event.target.files[0];
    let fileReader = new FileReader();
    fileReader.onload = (e) => {
      this.arrayBuffer = fileReader.result;
      var data = new Uint8Array(this.arrayBuffer);
      var arr = new Array();
      for (var i = 0; i != data.length; ++i)
        arr[i] = String.fromCharCode(data[i]);
      var bstr = arr.join('');
      var workbook = XLSX.read(bstr, { type: 'binary' });
      var first_sheet_name = workbook.SheetNames[0];
      var worksheet = workbook.Sheets[first_sheet_name];
      const dataInExcel = XLSX.utils.sheet_to_json(worksheet, { raw: true });
      this.getDataArr(dataInExcel[0]);
    };
    await fileReader.readAsArrayBuffer(file);
  }

  getDataArr(data) {
    this.data = this.matrix.map((item) => {
      const majorVal = item['firstVal'];
      const connectLogic = structuredClone(item);
      delete connectLogic['firstVal'];
      const connectLogicArr = Object.entries(connectLogic).map(([k, v]) => k);
      return this.connectString(majorVal, connectLogicArr, data);
    });
  }

  connectString(major, connectLogicArr, data) {
    return connectLogicArr.map((t) => {
      return this.createPass(major, t, data);
    });
  }

  createPass(fv, lv, data) {
    const resultFirst = this.generateString(
      String(data[fv])?.replaceAll(' ', ''),
      fv,
    );
    const resultLast = this.generateString(
      String(data[lv])?.replaceAll(' ', ''),
      lv,
    );
    return resultFirst
      .flatMap((i) => {
        return resultLast.map((l) => {
          return i + l;
        });
      })
      .filter(function (item, pos, self) {
        return self.indexOf(item) == pos;
      });
  }

  generateString(str, type) {
    if (type === 'birthday') {
      const result = [];
      this.dateRule.forEach((p) => {
        const value = dayjs(new Date((+str - 25569) * 86400000)).format(p);
        result.push(value);
        Object.keys(this.numberRule).forEach((k) => {
          if (value.includes(k)) {
            if (this.numberRule[k].length > 1) {
              this.numberRule[k].forEach((changeVal) => {
                result.push(this.stringFormat(k, changeVal, value));
              });
            } else {
              const changeVal = this.numberRule[k][0];
              result.push(this.stringFormat(k, changeVal, value));
            }
          }
        });
      });

      return result;
    } else {
      const result = [str, this.capitalizeFirstLetter(str)];
      Object.keys(this.rule).forEach((k) => {
        if (str.includes(k)) {
          result.forEach((i) => {
            if (this.rule[k].length > 1) {
              this.rule[k].forEach((changeVal) => {
                result.push(this.stringFormat(k, changeVal, i));
              });
            } else {
              const changeVal = this.rule[k][0];
              result.push(this.stringFormat(k, changeVal, i));
            }
          });
        }
      });
      return result;
    }
  }

  capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

  stringFormat(k, changeVal, str) {
    if (str.includes(k)) {
      this.stringFormat(k, changeVal, str.replace(k, changeVal));
      return str.replace(k, changeVal);
    } else {
      return;
    }
  }
}
