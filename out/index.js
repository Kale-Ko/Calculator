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
            constructor(children) {
                super();
                this.children = children;
            }
        }
        Elements.ParsedTree = ParsedTree;
        class ParsedFunction extends ParsedElement {
            name;
            args;
            constructor(name, args) {
                super();
                this.name = name;
                this.args = args;
            }
        }
        Elements.ParsedFunction = ParsedFunction;
    })(Elements = Calculator.Elements || (Calculator.Elements = {}));
    class Parser {
        string;
        pointer;
        constructor(string) {
            this.string = string;
            this.pointer = 0;
        }
        parse() {
            let tree = new Elements.ParsedTree([]);
            while (this.hasNext()) {
                let char = this.readNext();
                let charCode = char.charCodeAt(0);
                if (charCode <= 32) { // Invisible character / space / newline
                    continue;
                }
                if (charCode === 40 && Settings.parenthesisEnabled) { // Opening parenthesis
                    let parenthesis = "";
                    let hasClosing = false;
                    let childParenthesisCount = 0;
                    while (this.hasNext()) {
                        let nextChar = this.peekNext();
                        let nextCharCode = nextChar.charCodeAt(0);
                        if (nextCharCode !== 41) { // Not closing parenthesis
                            this.consumeNext();
                            parenthesis += nextChar;
                            if (nextCharCode === 40) {
                                childParenthesisCount++;
                            }
                        }
                        else {
                            childParenthesisCount--;
                            this.consumeNext();
                            if (childParenthesisCount < 0) {
                                hasClosing = true;
                                break;
                            }
                            else {
                                parenthesis += nextChar; // For sub-parenthesis
                            }
                        }
                    }
                    if (!hasClosing) {
                        throw new Error("Syntax error (Missing closing parenthesis)");
                    }
                    let childParser = new Parser(parenthesis); // Recursive parsing
                    tree.children.push(new Elements.ParsedTree(childParser.parse().children));
                }
                else if (((charCode >= 65 && charCode <= 90) || (charCode >= 97 && charCode <= 122)) && Settings.parenthesisEnabled && Settings.functionsEnabled) { // A-Z a-z
                    let name = char;
                    let doneName = false;
                    let argC = 1;
                    let args = [""];
                    let hasClosing = false;
                    let childParenthesisCount = 0;
                    while (this.hasNext() && !doneName) {
                        let nextChar = this.peekNext();
                        let nextCharCode = nextChar.charCodeAt(0);
                        if ((nextCharCode >= 65 && nextCharCode <= 90) || (nextCharCode >= 97 && nextCharCode <= 122) || (nextCharCode >= 48 && nextCharCode <= 57) || nextCharCode === 46) { // Not closing parenthesis
                            this.consumeNext();
                            name += nextChar;
                        }
                        else {
                            this.consumeNext();
                            doneName = true;
                            break;
                        }
                    }
                    while (this.hasNext()) {
                        let nextChar = this.peekNext();
                        let nextCharCode = nextChar.charCodeAt(0);
                        if (nextCharCode === 44) { // Comma
                            this.consumeNext();
                            argC++;
                            args[argC - 1] = "";
                        }
                        else if (nextCharCode !== 41) { // Not closing parenthesis
                            this.consumeNext();
                            args[argC - 1] += nextChar;
                            if (nextCharCode === 40) {
                                childParenthesisCount++;
                            }
                        }
                        else {
                            childParenthesisCount--;
                            this.consumeNext();
                            if (childParenthesisCount < 0) {
                                hasClosing = true;
                                break;
                            }
                            else {
                                args[argC - 1] += nextChar; // For sub-parenthesis
                            }
                        }
                    }
                    if (!hasClosing) {
                        throw new Error("Syntax error (Missing closing parenthesis)");
                    }
                    let parsedArgs = [];
                    for (let child of args) {
                        let childParser = new Parser(child); // Recursive parsing
                        parsedArgs.push(childParser.parse());
                    }
                    tree.children.push(new Elements.ParsedFunction(name, parsedArgs));
                }
                else if ((charCode >= 48 && charCode <= 57) || charCode === 46) { // Number, decimal point
                    let num = char;
                    let isFloat = false;
                    while (this.hasNext()) {
                        let nextChar = this.peekNext();
                        let nextCharCode = nextChar.charCodeAt(0);
                        if ((nextCharCode >= 48 && nextCharCode <= 57) || nextCharCode === 46) { // Number, decimal point
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
                    throw new Error("Invalid/unknown character '" + char + "'" + (charCode === 41 ? " (Mismatched parenthesis)" : ""));
                }
            }
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
        static ORDER_OF_OPERATIONS_CORRECT = [[Elements.ParsedExponent.name], [Elements.ParsedTimes.name, Elements.ParsedDivide.name, Elements.ParsedModulo.name], [Elements.ParsedPlus.name, Elements.ParsedMinus.name]];
        static ORDER_OF_OPERATIONS_SIMPLE = [[Elements.ParsedExponent.name], [Elements.ParsedTimes.name], [Elements.ParsedDivide.name], [Elements.ParsedModulo.name], [Elements.ParsedPlus.name], [Elements.ParsedMinus.name]];
        static FUNCTIONS = {
            "abs": Solver.wrapMethod(Math.abs, 1),
            "sign": Solver.wrapMethod(Math.sign, 1),
            "max": Solver.wrapMethod(Math.max, "any"),
            "min": Solver.wrapMethod(Math.min, "any"),
            "clamp": Solver.wrapMethod((x, min, max) => {
                return Math.max(Math.min(x, max), min);
            }, 3),
            "floor": Solver.wrapMethod(Math.floor, 1),
            "ceil": Solver.wrapMethod(Math.ceil, 1),
            "round": Solver.wrapMethod(Math.round, 1),
            "pow": Solver.wrapMethod(Math.pow, 2),
            "exp": Solver.wrapMethod(Math.exp, 1),
            "expm1": Solver.wrapMethod(Math.exp, 1),
            "sqrt": Solver.wrapMethod(Math.sqrt, 1),
            "cbrt": Solver.wrapMethod(Math.cbrt, 1),
            "sin": Solver.wrapMethod(Math.sin, 1),
            "sinh": Solver.wrapMethod(Math.sinh, 1),
            "asin": Solver.wrapMethod(Math.asin, 1),
            "asinh": Solver.wrapMethod(Math.asinh, 1),
            "cos": Solver.wrapMethod(Math.cos, 1),
            "cosh": Solver.wrapMethod(Math.cosh, 1),
            "acos": Solver.wrapMethod(Math.acos, 1),
            "acosh": Solver.wrapMethod(Math.acosh, 1),
            "tan": Solver.wrapMethod(Math.tan, 1),
            "tanh": Solver.wrapMethod(Math.tanh, 1),
            "atan": Solver.wrapMethod(Math.floor, 1),
            "atan2": Solver.wrapMethod(Math.floor, 1),
            "atanh": Solver.wrapMethod(Math.floor, 1),
            "log": Solver.wrapMethod(Math.log, 1),
            "log2": Solver.wrapMethod(Math.log2, 1),
            "log10": Solver.wrapMethod(Math.log10, 1),
            "log1p": Solver.wrapMethod(Math.log1p, 1),
            "random": Solver.wrapMethods(Math.random, (x) => {
                return Math.random() * x;
            }, 0, 1),
            "hypot": Solver.wrapMethod(Math.hypot, "any") // square root of the sum of squares of arguments
        };
        static wrapMethod(method, argC) {
            return (...args) => {
                if (arguments.length == argC || argC == "any") {
                    method(args);
                }
                else {
                    throw new Error("Incorrect number of args");
                }
            };
        }
        static wrapMethods(method1, method2, arg1C, arg2C) {
            return (...args) => {
                if (arguments.length == arg1C) {
                    method1(args);
                }
                else if (arguments.length == arg2C || arg2C == "any") {
                    method2(args);
                }
                else {
                    throw new Error("Incorrect number of args");
                }
            };
        }
        tree;
        constructor(tree) {
            this.tree = tree;
        }
        solve() {
            if (this.tree.children.length == 0) { // Empty equation
                return 0;
            }
            for (let pointer = 0; pointer < this.tree.children.length; pointer++) { // Parse parenthesis
                if (this.tree.children[pointer] instanceof Elements.ParsedTree) {
                    let childTree = this.tree.children[pointer];
                    let solver = new Solver(childTree);
                    this.tree.children[pointer] = new Elements.ParsedFloat("()", solver.solve());
                }
                else if (this.tree.children[pointer] instanceof Elements.ParsedFunction) {
                    let childTree = this.tree.children[pointer];
                    for (let pointer = 0; pointer < childTree.args.length; pointer++) { // Parse parenthesis
                        if (childTree.args[pointer] instanceof Elements.ParsedTree) {
                            let subChildTree = childTree.args[pointer];
                            let solver = new Solver(subChildTree);
                            childTree.args[pointer] = new Elements.ParsedFloat("()", solver.solve());
                        }
                    }
                    console.log(childTree);
                }
            }
            for (let operations of (Settings.orderOfOperationsMode === "simple" ? Solver.ORDER_OF_OPERATIONS_SIMPLE : Solver.ORDER_OF_OPERATIONS_CORRECT)) { // Parse equations
                for (let pointer = 0; pointer < this.tree.children.length; pointer++) {
                    if (this.tree.children[pointer] instanceof Elements.ParsedOperation) {
                        let n1 = this.tree.children[pointer - 1];
                        let n2 = this.tree.children[pointer + 1];
                        let operation = this.tree.children[pointer];
                        if (n1 instanceof Elements.ParsedNumber && n2 instanceof Elements.ParsedNumber) {
                            if (operations.includes(operation.constructor.name)) {
                                if (operation instanceof Elements.ParsedPlus) {
                                    this.tree.children[pointer - 1] = new Elements.ParsedFloat(n1.raw + " " + operation.raw + " " + n2.raw, n1.number + n2.number);
                                    this.tree.children.splice(pointer, 2);
                                    pointer--;
                                }
                                else if (operation instanceof Elements.ParsedMinus) {
                                    this.tree.children[pointer - 1] = new Elements.ParsedFloat(n1.raw + " " + operation.raw + " " + n2.raw, n1.number - n2.number);
                                    this.tree.children.splice(pointer, 2);
                                    pointer--;
                                }
                                else if (operation instanceof Elements.ParsedTimes) {
                                    this.tree.children[pointer - 1] = new Elements.ParsedFloat(n1.raw + " " + operation.raw + " " + n2.raw, n1.number * n2.number);
                                    this.tree.children.splice(pointer, 2);
                                    pointer--;
                                }
                                else if (operation instanceof Elements.ParsedDivide) {
                                    this.tree.children[pointer - 1] = new Elements.ParsedFloat(n1.raw + " " + operation.raw + " " + n2.raw, n1.number / n2.number);
                                    this.tree.children.splice(pointer, 2);
                                    pointer--;
                                }
                                else if (operation instanceof Elements.ParsedExponent) {
                                    this.tree.children[pointer - 1] = new Elements.ParsedFloat(n1.raw + " " + operation.raw + " " + n2.raw, n1.number ** n2.number);
                                    this.tree.children.splice(pointer, 2);
                                    pointer--;
                                }
                                else if (operation instanceof Elements.ParsedModulo) {
                                    this.tree.children[pointer - 1] = new Elements.ParsedFloat(n1.raw + " " + operation.raw + " " + n2.raw, n1.number % n2.number);
                                    this.tree.children.splice(pointer, 2);
                                    pointer--;
                                }
                            }
                        }
                        else {
                            throw new Error("Syntax error (Operator must be passed two numbers)");
                        }
                    }
                }
            }
            if (this.tree.children.length !== 1) {
                throw new Error("Syntax error (Missing equation)");
            }
            if (this.tree.children[0] instanceof Elements.ParsedNumber) {
                return this.tree.children[0].number;
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
            this.calculate();
        }
        calculate() {
            try {
                console.log("Input", this.inputElement.value);
                let parser = new Parser(this.inputElement.value);
                let tree = parser.parse();
                console.log("Parsed", JSON.stringify(tree, null, 2));
                let solver = new Solver(tree);
                let result = solver.solve();
                console.log("Solved", result.toString());
                this.outputElement.innerText = result.toString();
            }
            catch (e) {
                this.outputElement.innerText = "ERR";
                console.warn(e);
            }
        }
    }
    Calculator.Instance = Instance;
    class Settings {
        static parenthesisEnabled = true;
        static functionsEnabled = true;
        static orderOfOperationsMode = "correct";
    }
    Calculator.Settings = Settings;
})(Calculator || (Calculator = {}));
window.Calculator = Calculator;
let instance = new Calculator.Instance();
instance.init();
//# sourceMappingURL=index.js.map