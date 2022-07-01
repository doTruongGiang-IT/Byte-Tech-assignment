import { Component, OnInit } from '@angular/core';
import { APP_CONSTANT } from './appConstant';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  mathExpression = '';
  previousExpression = '';
  readonly buttons = APP_CONSTANT.BUTTONS;
  readonly operators = APP_CONSTANT.OPERATORS;

  // Check if the math expression is correct format
  private regexForMathExpression = '^[(]?[-+÷x%]?([0-9%]+)[)]??([(]?([-+÷x%]([0-9%]+))?([.,][0-9%]+)?[)]?)*$';
  private deleteOperandCount = 3;
  private defaultOperand = '0';

  constructor() {}

  ngOnInit(): void {

  }

  setExpression(operand: string): string {
    switch (operand) {
      case this.operators.EQUAL:
        return this.mathExpression.match(this.regexForMathExpression) !== null ? this.calculate(this.mathExpression) : this.mathExpression = 'Expression is not correct';
      case this.operators.RESET:
        return this.previousExpression = this.mathExpression = '';
      case this.operators.MINUS_PLUS:
        const indexOfMinus = this.mathExpression.indexOf(this.operators.MINUS);

        // Check expression with minus sign first
        if (indexOfMinus !== -1 && indexOfMinus === 0) {
          this.mathExpression = this.mathExpression.slice(1);
        } else {
          this.mathExpression = this.operators.MINUS.concat(this.mathExpression);
        }

        return this.mathExpression;
      default:
        return this.mathExpression += operand;
    }
  }

  formatExpression(mathExpression: string): string[] {
    let expression = mathExpression;
    const copyExp = expression;

    // Split expression into array by operator but still keep that operator
    expression = expression.replace(/[0-9%]+/g, '#').replace(/[\(|\|\.)]/g, '');
    const numbers = copyExp.split(/[^0-9%\.]+/);
    const operators = expression.split('#').filter((operand: string): string => operand);
    const result = [];

    for (let i = 0; i < numbers.length; i++){
      result.push(numbers[i]);
      if (i < operators.length) {
        result.push(operators[i]);
      }
    }

    // Replace the first element with defaultOperand='0' if it's empty
    if (result[0] === '') {
      result[0] = this.defaultOperand;
    }

    return result;
  }

  calculate(mathExpression: string): string {
    let operands = this.formatExpression(mathExpression);

    this.previousExpression = mathExpression;

    operands = this.convertPercentNumber(operands);

    while (operands.includes(this.operators.MULTIPLY) || operands.includes(this.operators.DIVIDE)) {
      operands = this.multiplyAndDivide(operands);
    }

    while (operands.length > 1) {
      operands = this.plusAndMinus(operands);
    }

    return this.mathExpression = operands[0].toString();
  }

  convertPercentNumber(operands: string[]): string[] {
    operands = operands.map((operand) => {
      if (operand.includes(this.operators.PERCENT)) {
        operand = String(Number.parseFloat(operand) / 100);
      }
      return operand;
    });

    return operands;
  }

  multiplyAndDivide(operands: string[]): any {
    for (let i = 0; i < operands.length; i++) {
      if (operands[i] === this.operators.MULTIPLY) {
        const cal = String(Number.parseFloat(operands[i - 1]) * Number.parseFloat(operands[i + 1]));

        // Insert result after the i+1 element and then remove 3 element before it. VD: ['2', '*', '5'] => ['2', '*', '5', '10'] => ['10']
        return this.formatExpressionAfterCalculate(operands, cal, i);
      }

      if (operands[i] === this.operators.DIVIDE) {
        const cal = String(Number.parseFloat(operands[i - 1]) / Number.parseFloat(operands[i + 1]));

        // Insert result after the i+1 element and then remove 3 element before it. VD: ['2', '/', '5'] => ['2', '/', '5', '0.4'] => ['0.4']
        return this.formatExpressionAfterCalculate(operands, cal, i);
      }
    }
  }

  plusAndMinus(operands: string[]): any {
    for (let i = 1; i < operands.length; i++) {
      if (operands[i] === this.operators.PLUS) {
        const cal = String(Number.parseFloat(operands[i - 1]) + Number.parseFloat(operands[i + 1]));

        // Insert result after the i+1 element and then remove 3 element before it. VD: ['2', '+', '5'] => ['2', '+', '5', '7'] => ['7']
        return this.formatExpressionAfterCalculate(operands, cal, i);
      }

      if (operands[i] === this.operators.MINUS) {
        const cal = String(Number.parseFloat(operands[i - 1]) - Number.parseFloat(operands[i + 1]));

        // Insert result after the i+1 element and then remove 3 element before it. VD: ['2', '-', '5'] => ['2', '-', '5', '-3'] => ['-3']
        return this.formatExpressionAfterCalculate(operands, cal, i);
      }
    }
  }

  formatExpressionAfterCalculate(operands: string[], cal: string, index: number): string[] {
    operands.splice(index + 2, 0, cal);
    operands.splice(index - 1, this.deleteOperandCount);
    return operands;
  }

}
