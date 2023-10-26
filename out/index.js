"use strict";
var Calculator;
(function (Calculator) {
    let Elements;
    (function (Elements) {
        class ParsedElement {
            constructor() { }
        }
        Elements.ParsedElement = ParsedElement;
        class ParsedToken {
            raw;
            constructor(raw) {
                this.raw = raw;
            }
        }
        Elements.ParsedToken = ParsedToken;
        class ParsedNumber extends ParsedToken {
            number;
            constructor(raw, number) {
                super(raw);
                this.number = number;
            }
        }
        Elements.ParsedNumber = ParsedNumber;
        class ParsedInteger extends ParsedNumber {
            constructor(raw, number) {
                super(raw, number);
            }
        }
        Elements.ParsedInteger = ParsedInteger;
        class ParsedFloat extends ParsedNumber {
            constructor(raw, number) {
                super(raw, number);
            }
        }
        Elements.ParsedFloat = ParsedFloat;
        class ParsedOperation extends ParsedToken {
            constructor(raw) {
                super(raw);
            }
        }
        Elements.ParsedOperation = ParsedOperation;
        class ParsedPlus extends ParsedOperation {
            constructor(raw) {
                super(raw);
            }
        }
        Elements.ParsedPlus = ParsedPlus;
        class ParsedMinus extends ParsedOperation {
            constructor(raw) {
                super(raw);
            }
        }
        Elements.ParsedMinus = ParsedMinus;
        class ParsedTimes extends ParsedOperation {
            constructor(raw) {
                super(raw);
            }
        }
        Elements.ParsedTimes = ParsedTimes;
        class ParsedDivide extends ParsedOperation {
            constructor(raw) {
                super(raw);
            }
        }
        Elements.ParsedDivide = ParsedDivide;
        class ParsedExponent extends ParsedOperation {
            constructor(raw) {
                super(raw);
            }
        }
        Elements.ParsedExponent = ParsedExponent;
        class ParsedModulo extends ParsedOperation {
            constructor(raw) {
                super(raw);
            }
        }
        Elements.ParsedModulo = ParsedModulo;
        class ParsedTree extends ParsedElement {
            children;
            constructor() {
                super();
                this.children = [];
            }
        }
        Elements.ParsedTree = ParsedTree;
    })(Elements = Calculator.Elements || (Calculator.Elements = {}));
    class Parser {
        string;
        pointer;
        constructor(string) {
            this.string = string;
            this.pointer = 0;
        }
        parse() {
            let tree = new Elements.ParsedTree();
            while (this.hasNext()) {
                let char = this.readNext();
                let charCode = char.charCodeAt(0);
                if (charCode <= 32) { // Invisible character / space / newline
                    continue;
                }
                if (charCode === 40) { // Opening parenthesis, closing parenthesis
                    let parenthesis = "";
                    while (this.hasNext()) {
                        let nextChar = this.peekNext();
                        let nextCharCode = nextChar.charCodeAt(0);
                        if (nextCharCode !== 41) {
                            this.consumeNext();
                            parenthesis += nextChar;
                        }
                        else {
                            this.consumeNext();
                            break;
                        }
                    }
                    let childParser = new Parser(parenthesis); // Recursive parsing
                    tree.children.push(childParser.parse());
                }
                else if ((charCode >= 48 && charCode <= 57) || charCode === 46) { // Number, decimal point
                    let num = char;
                    let isFloat = false;
                    while (this.hasNext()) {
                        let nextChar = this.peekNext();
                        let nextCharCode = nextChar.charCodeAt(0);
                        if ((nextCharCode >= 48 && nextCharCode <= 57) || nextCharCode === 46) {
                            this.consumeNext();
                            num += nextChar;
                            if (nextCharCode === 46) {
                                isFloat = true;
                            }
                        }
                        else {
                            break;
                        }
                    }
                    if (!isFloat) {
                        let parsedNum = parseInt(num);
                        tree.children.push(new Elements.ParsedInteger(num, parsedNum));
                    }
                    else {
                        let parsedNum = parseFloat(num);
                        tree.children.push(new Elements.ParsedFloat(num, parsedNum));
                    }
                }
                else if (charCode === 43) { // Plus
                    tree.children.push(new Elements.ParsedPlus(char));
                }
                else if (charCode === 45) { // Minus
                    tree.children.push(new Elements.ParsedMinus(char));
                }
                else if (charCode === 42) { // Times
                    tree.children.push(new Elements.ParsedTimes(char));
                }
                else if (charCode === 47) { // Divide
                    tree.children.push(new Elements.ParsedDivide(char));
                }
                else if (charCode === 94) { // Exponent
                    tree.children.push(new Elements.ParsedExponent(char));
                }
                else if (charCode === 37) { // Modulo
                    tree.children.push(new Elements.ParsedModulo(char));
                }
                else {
                    throw new Error("Invalid/unknown character");
                }
            }
            console.log(JSON.stringify(tree.children, null, 2));
            return tree;
        }
        hasNext() {
            return this.pointer < this.string.length;
        }
        readNext() {
            this.pointer++;
            return this.string[this.pointer - 1];
        }
        peekNext() {
            return this.string[this.pointer];
        }
        consumeNext() {
            this.pointer++;
        }
    }
    Calculator.Parser = Parser;
    class Solver {
        static ORDER_OF_OPERATIONS = [[Elements.ParsedExponent.name], [Elements.ParsedTimes.name], [Elements.ParsedDivide.name], [Elements.ParsedModulo.name], [Elements.ParsedPlus.name], [Elements.ParsedMinus.name]];
        static ORDER_OF_OPERATIONS_CORRECT = [[Elements.ParsedExponent.name], [Elements.ParsedTimes.name, Elements.ParsedDivide.name, Elements.ParsedModulo.name], [Elements.ParsedPlus.name, Elements.ParsedMinus.name]];
        tree;
        constructor(tree) {
            this.tree = tree;
        }
        solve() {
            return this.evaluate(this.tree);
        }
        evaluate(element) {
            for (let operations of Solver.ORDER_OF_OPERATIONS_CORRECT) {
                for (let pointer = 0; pointer < element.children.length; pointer++) {
                    if (element.children[pointer] instanceof Elements.ParsedOperation) {
                        let n1 = element.children[pointer - 1];
                        let n2 = element.children[pointer + 1];
                        let operation = element.children[pointer];
                        if (n1 instanceof Elements.ParsedNumber && n2 instanceof Elements.ParsedNumber) {
                            if (operations.includes(operation.constructor.name)) {
                                if (operation instanceof Elements.ParsedPlus) {
                                    element.children[pointer - 1] = new Elements.ParsedFloat(n1.raw + " " + operation.raw + " " + n2.raw, n1.number + n2.number);
                                    element.children.splice(pointer, 2);
                                    pointer--;
                                }
                                else if (operation instanceof Elements.ParsedMinus) {
                                    element.children[pointer - 1] = new Elements.ParsedFloat(n1.raw + " " + operation.raw + " " + n2.raw, n1.number - n2.number);
                                    element.children.splice(pointer, 2);
                                    pointer--;
                                }
                                else if (operation instanceof Elements.ParsedTimes) {
                                    element.children[pointer - 1] = new Elements.ParsedFloat(n1.raw + " " + operation.raw + " " + n2.raw, n1.number * n2.number);
                                    element.children.splice(pointer, 2);
                                    pointer--;
                                }
                                else if (operation instanceof Elements.ParsedDivide) {
                                    element.children[pointer - 1] = new Elements.ParsedFloat(n1.raw + " " + operation.raw + " " + n2.raw, n1.number / n2.number);
                                    element.children.splice(pointer, 2);
                                    pointer--;
                                }
                                else if (operation instanceof Elements.ParsedExponent) {
                                    element.children[pointer - 1] = new Elements.ParsedFloat(n1.raw + " " + operation.raw + " " + n2.raw, n1.number ** n2.number);
                                    element.children.splice(pointer, 2);
                                    pointer--;
                                }
                                else if (operation instanceof Elements.ParsedModulo) {
                                    element.children[pointer - 1] = new Elements.ParsedFloat(n1.raw + " " + operation.raw + " " + n2.raw, n1.number % n2.number);
                                    element.children.splice(pointer, 2);
                                    pointer--;
                                }
                                else {
                                    throw new Error("Unknown operation");
                                }
                            }
                        }
                        else {
                            throw new Error("Operator must be passed two numbers");
                        }
                    }
                }
            }
            console.log(JSON.stringify(element.children, null, 2));
            if (element.children.length !== 1) {
                throw new Error("Syntax error (Missing equation)");
            }
            if (element.children[0] instanceof Elements.ParsedNumber) {
                return element.children[0].number;
            }
            else {
                throw new Error("Syntax error (Missing numbers)");
            }
        }
    }
    Calculator.Solver = Solver;
    class Instance {
        rootElement;
        inputElement;
        outputElement;
        constructor() {
            this.rootElement = document.querySelector("#calculator");
            this.inputElement = this.rootElement.querySelector(".calculator_input");
            this.outputElement = this.rootElement.querySelector(".calculator_output");
        }
        init() {
            this.inputElement.addEventListener("keydown", (event) => {
                let key = event.key.toLowerCase();
                if (key === "enter") {
                    this.calculate();
                }
            });
        }
        calculate() {
            try {
                let parser = new Parser(this.inputElement.value);
                let tree = parser.parse();
                let solver = new Solver(tree);
                let result = solver.solve();
                this.outputElement.innerText = result.toString();
            }
            catch (e) {
                this.outputElement.innerText = "ERR";
                console.warn(e);
            }
        }
    }
    Calculator.Instance = Instance;
})(Calculator || (Calculator = {}));
window.Calculator = Calculator;
let instance = new Calculator.Instance();
instance.init();
instance.calculate();
//# sourceMappingURL=index.js.map