import { useState } from 'react';
import './App.css';
import appConstant from './constants';

function App() {
  const [mathExpression, setMathExpression] = useState('');
  const [previousExpression, setPreviousExpression] = useState('');

  // Check if the math expression is correct format
  const regexForMathExpression = "^[(]?[-+÷x%]?([0-9%]+)[)]??([(]?([-+÷x%]([0-9%]+))?([.,][0-9%]+)?[)]?)*$";
  const deleteOperandCount = 3;
  const defaultOperand = '0'
  const operators = appConstant.OPERATORS;

  const setExpression = (operand) => {
    switch (operand) {
      case operators.EQUAL:
        return mathExpression.match(regexForMathExpression) !== null ? calculate(mathExpression) : setMathExpression('Expression is not correct');
      case operators.RESET:
        setPreviousExpression('');
        return setMathExpression('');
      case operators.MINUS_PLUS:
        let result = '';
        let indexOfMinus = mathExpression.indexOf(operators.MINUS);

        // Check expression with minus sign first
        if (indexOfMinus !== -1 && indexOfMinus === 0) {
          result = mathExpression.slice(1);
        } else {
          result = operators.MINUS.concat(mathExpression);
        };
        return setMathExpression(result);
      default:
        return setMathExpression(previous => previous += operand);
    };
  }

  const showButtons = (buttons) => {
    let result = [];
    if(buttons.length > 0) {
      result = buttons.map((button, index) => {
        return <button key={index} className={button.class} onClick={() => setExpression(button.value)}>{ button.label }</button>;
      })
    };
    return result;
  };

  const formatExpression = (mathExpression) => {
    let expression = mathExpression;
    let copyExp = expression;

    // Split expression into array by operator but still keep that operator
    expression = expression.replace(/[0-9%]+/g, "#").replace(/[\(|\|\.)]/g, "");
    let numbers = copyExp.split(/[^0-9%\.]+/);
    let operators = expression.split("#").filter((operand) => { return operand });
    let result = [];

    for(let i = 0; i < numbers.length; i++){
      result.push(numbers[i]);
      if (i < operators.length) {
        result.push(operators[i]);
      };
    };

    // Replace the first element with defaultOperand='0' if it's empty 
    if (result[0] === '') {
      result[0] = defaultOperand
    };

    return result;
  }

  const calculate = (mathExpression) => {
    let operands = formatExpression(mathExpression);

    setPreviousExpression(mathExpression);

    operands = convertPercentNumber(operands);

    while(operands.includes(operators.MULTIPLY) || operands.includes(operators.DIVIDE)) {
      operands = multiplyAndDivide(operands);
    }

    while(operands.length > 1) {
      operands = plusAndMinus(operands);
    }

		return setMathExpression(operands[0].toString());
  };

  const convertPercentNumber = (operands) => {
    operands = operands.map((operand) => {
      if (operand.includes(operators.PERCENT)) {
        operand = String(Number.parseFloat(operand) / 100);
      };
      return operand;
    });

    return operands;
  }

  const multiplyAndDivide = (operands) => {
    for(let i = 0; i < operands.length; i++) {
      if(operands[i] === operators.MULTIPLY) {
				const cal = String(Number.parseFloat(operands[i-1]) * Number.parseFloat(operands[i+1]));

        //Insert result after the i+1 element and then remove 3 element before it. VD: ['2', '*', '5'] => ['2', '*', '5', '10'] => ['10']
				return formatExpressionAfterCalculate(operands, cal, i);
			};

			if(operands[i] === operators.DIVIDE) {
				const cal = String(Number.parseFloat(operands[i-1]) / Number.parseFloat(operands[i+1]));

        //Insert result after the i+1 element and then remove 3 element before it. VD: ['2', '/', '5'] => ['2', '/', '5', '0.4'] => ['0.4']
        return formatExpressionAfterCalculate(operands, cal, i);
			};
		};
  }

  const plusAndMinus = (operands) => {
    for(let i = 1; i < operands.length; i++) {
      if(operands[i] === operators.PLUS) {
				const cal = String(Number.parseFloat(operands[i-1]) + Number.parseFloat(operands[i+1]));

        //Insert result after the i+1 element and then remove 3 element before it. VD: ['2', '+', '5'] => ['2', '+', '5', '7'] => ['7']
        return formatExpressionAfterCalculate(operands, cal, i);
			};

			if(operands[i] === operators.MINUS) {
				const cal = String(Number.parseFloat(operands[i-1]) - Number.parseFloat(operands[i+1]));

        //Insert result after the i+1 element and then remove 3 element before it. VD: ['2', '-', '5'] => ['2', '-', '5', '-3'] => ['-3']
        return formatExpressionAfterCalculate(operands, cal, i);
			};
    };
  };

  const formatExpressionAfterCalculate = (operands, cal, index) => {
    operands.splice(index+2, 0, cal);
    operands.splice(index-1, deleteOperandCount);
    return operands;
  };

  return (
    <div className="calculator">
      <div className='calculator-output'>
        <p className='calculator-output__previous'>{ previousExpression }</p>
        <p className='calculator-output__current'>{ mathExpression ? mathExpression : '0' }</p>
      </div>
      <>
        { showButtons(appConstant.BUTTONS) }
      </>
    </div>
  );
}

export default App;