namespace Calculator {
    export namespace Elements {
        export class ParsedElement {
            protected constructor() { }
        }

        export class ParsedToken {
            public raw: string;

            protected constructor(raw: string) {
                this.raw = raw;
            }
        }

        export class ParsedNumber extends ParsedToken {
            public number: number;

            protected constructor(raw: string, number: number) {
                super(raw);

                this.number = number;
            }
        }

        export class ParsedInteger extends ParsedNumber {
            public constructor(raw: string, number: number) {
                super(raw, number);
            }
        }

        export class ParsedFloat extends ParsedNumber {
            public constructor(raw: string, number: number) {
                super(raw, number);
            }
        }

        export class ParsedOperation extends ParsedToken {
            protected constructor(raw: string) {
                super(raw);
            }
        }

        export class ParsedPlus extends ParsedOperation {
            public constructor(raw: string) {
                super(raw);
            }
        }

        export class ParsedMinus extends ParsedOperation {
            public constructor(raw: string) {
                super(raw);
            }
        }

        export class ParsedTimes extends ParsedOperation {
            public constructor(raw: string) {
                super(raw);
            }
        }

        export class ParsedDivide extends ParsedOperation {
            public constructor(raw: string) {
                super(raw);
            }
        }

        export class ParsedExponent extends ParsedOperation {
            public constructor(raw: string) {
                super(raw);
            }
        }

        export class ParsedModulo extends ParsedOperation {
            public constructor(raw: string) {
                super(raw);
            }
        }

        export class ParsedTree extends ParsedElement {
            public children: ParsedElement[];

            public constructor(children: ParsedElement[]) {
                super();

                this.children = children;
            }
        }

        export class ParsedFunction extends ParsedElement {
            public name: string;
            public args: ParsedElement[];

            public constructor(name: string, args: ParsedElement[]) {
                super();

                this.name = name;
                this.args = args;
            }
        }
    }

    export class Parser {
        protected string: string;
        protected pointer: number;

        public constructor(string: string) {
            this.string = string;
            this.pointer = 0;
        }

        public parse(): Elements.ParsedTree {
            let tree: Elements.ParsedTree = new Elements.ParsedTree([]);

            while (this.hasNext()) {
                let char: string = this.readNext();
                let charCode: number = char.charCodeAt(0);

                if (charCode <= 32) { // Invisible character / space / newline
                    continue;
                }

                if (charCode === 40 && Settings.parenthesisEnabled) { // Opening parenthesis
                    let parenthesis: string = "";
                    let hasClosing = false;
                    let childParenthesisCount: number = 0;

                    while (this.hasNext()) {
                        let nextChar = this.peekNext();
                        let nextCharCode: number = nextChar.charCodeAt(0);

                        if (nextCharCode !== 41) { // Not closing parenthesis
                            this.consumeNext();

                            parenthesis += nextChar;
                            if (nextCharCode === 40) {
                                childParenthesisCount++;
                            }
                        } else {
                            childParenthesisCount--;
                            this.consumeNext();

                            if (childParenthesisCount < 0) {
                                hasClosing = true;

                                break;
                            } else {
                                parenthesis += nextChar; // For sub-parenthesis
                            }
                        }
                    }

                    if (!hasClosing) {
                        throw new Error("Syntax error (Missing closing parenthesis)");
                    }

                    let childParser: Parser = new Parser(parenthesis); // Recursive parsing
                    tree.children.push(new Elements.ParsedTree(childParser.parse().children));
                } else if (((charCode >= 65 && charCode <= 90) || (charCode >= 97 && charCode <= 122)) && Settings.parenthesisEnabled && Settings.functionsEnabled) { // A-Z a-z
                    let name: string = char;
                    let doneName = false;
                    let argC = 1;
                    let args: string[] = [""];
                    let hasClosing = false;
                    let childParenthesisCount: number = 0;

                    while (this.hasNext() && !doneName) {
                        let nextChar = this.peekNext();
                        let nextCharCode: number = nextChar.charCodeAt(0);

                        if ((nextCharCode >= 65 && nextCharCode <= 90) || (nextCharCode >= 97 && nextCharCode <= 122) || (nextCharCode >= 48 && nextCharCode <= 57) || nextCharCode === 46) { // Not closing parenthesis
                            this.consumeNext();

                            name += nextChar;
                        } else {
                            this.consumeNext();

                            doneName = true;
                            break;
                        }
                    }

                    while (this.hasNext()) {
                        let nextChar = this.peekNext();
                        let nextCharCode: number = nextChar.charCodeAt(0);

                        if (nextCharCode === 44) { // Comma
                            this.consumeNext();

                            argC++;
                            args[argC - 1] = "";
                        } else if (nextCharCode !== 41) { // Not closing parenthesis
                            this.consumeNext();

                            args[argC - 1] += nextChar;
                            if (nextCharCode === 40) {
                                childParenthesisCount++;
                            }
                        } else {
                            childParenthesisCount--;
                            this.consumeNext();

                            if (childParenthesisCount < 0) {
                                hasClosing = true;

                                break;
                            } else {
                                args[argC - 1] += nextChar; // For sub-parenthesis
                            }
                        }
                    }

                    if (!hasClosing) {
                        throw new Error("Syntax error (Missing closing parenthesis)");
                    }

                    let parsedArgs: Elements.ParsedTree[] = [];

                    for (let child of args) {
                        let childParser: Parser = new Parser(child); // Recursive parsing
                        parsedArgs.push(childParser.parse());
                    }

                    tree.children.push(new Elements.ParsedFunction(name, parsedArgs));
                } else if ((charCode >= 48 && charCode <= 57) || charCode === 46) { // Number, decimal point
                    let num: string = char;
                    let isFloat: boolean = false;

                    while (this.hasNext()) {
                        let nextChar = this.peekNext();
                        let nextCharCode: number = nextChar.charCodeAt(0);

                        if ((nextCharCode >= 48 && nextCharCode <= 57) || nextCharCode === 46) { // Number, decimal point
                            this.consumeNext();

                            num += nextChar;
                            if (nextCharCode === 46) {
                                isFloat = true;
                            }
                        } else {
                            break;
                        }
                    }

                    if (!isFloat) {
                        let parsedNum: number = parseInt(num);
                        tree.children.push(new Elements.ParsedInteger(num, parsedNum));
                    } else {
                        let parsedNum: number = parseFloat(num);
                        tree.children.push(new Elements.ParsedFloat(num, parsedNum));
                    }
                } else if (charCode === 43) { // Plus
                    tree.children.push(new Elements.ParsedPlus(char));
                } else if (charCode === 45) { // Minus
                    tree.children.push(new Elements.ParsedMinus(char));
                } else if (charCode === 42) { // Times
                    tree.children.push(new Elements.ParsedTimes(char));
                } else if (charCode === 47) { // Divide
                    tree.children.push(new Elements.ParsedDivide(char));
                } else if (charCode === 94) { // Exponent
                    tree.children.push(new Elements.ParsedExponent(char));
                } else if (charCode === 37) { // Modulo
                    tree.children.push(new Elements.ParsedModulo(char));
                } else {
                    throw new Error("Invalid/unknown character '" + char + "'" + (charCode === 41 ? " (Mismatched parenthesis)" : ""));
                }
            }

            return tree;
        }

        protected hasNext(): boolean {
            return this.pointer < this.string.length;
        }

        protected readNext(): string {
            this.pointer++;
            return this.string[this.pointer - 1];
        }

        protected peekNext(): string {
            return this.string[this.pointer];
        }

        protected consumeNext(): void {
            this.pointer++;
        }
    }

    export class Solver {
        protected static ORDER_OF_OPERATIONS_CORRECT: string[][] = [[Elements.ParsedExponent.name], [Elements.ParsedTimes.name, Elements.ParsedDivide.name, Elements.ParsedModulo.name], [Elements.ParsedPlus.name, Elements.ParsedMinus.name]];
        protected static ORDER_OF_OPERATIONS_SIMPLE: string[][] = [[Elements.ParsedExponent.name], [Elements.ParsedTimes.name], [Elements.ParsedDivide.name], [Elements.ParsedModulo.name], [Elements.ParsedPlus.name], [Elements.ParsedMinus.name]];

        protected static FUNCTIONS: any = {
            "abs": Solver.wrapMethod(Math.abs, 1), // absolute value
            "sign": Solver.wrapMethod(Math.sign, 1), // sign (1, -1)

            "max": Solver.wrapMethod(Math.max, "any"), // largest number
            "min": Solver.wrapMethod(Math.min, "any"), // smallest number
            "clamp": Solver.wrapMethod((x: number, min: number, max: number): number => {
                return Math.max(Math.min(x, max), min);
            }, 3), // clamp to range
            "floor": Solver.wrapMethod(Math.floor, 1), // round down
            "ceil": Solver.wrapMethod(Math.ceil, 1), // round up
            "round": Solver.wrapMethod(Math.round, 1), // round

            "pow": Solver.wrapMethod(Math.pow, 2), // x^y
            "exp": Solver.wrapMethod(Math.exp, 1), // e^x
            "expm1": Solver.wrapMethod(Math.exp, 1), // (e^x)-1,

            "sqrt": Solver.wrapMethod(Math.sqrt, 1), // square root
            "cbrt": Solver.wrapMethod(Math.cbrt, 1), // cube root

            "sin": Solver.wrapMethod(Math.sin, 1), // sine
            "sinh": Solver.wrapMethod(Math.sinh, 1), // hyperbolic sine
            "asin": Solver.wrapMethod(Math.asin, 1), // inverse sine
            "asinh": Solver.wrapMethod(Math.asinh, 1), // inverse hyperbolic sine

            "cos": Solver.wrapMethod(Math.cos, 1), // cosine
            "cosh": Solver.wrapMethod(Math.cosh, 1), // hyperbolic cosine
            "acos": Solver.wrapMethod(Math.acos, 1), // inverse cosine
            "acosh": Solver.wrapMethod(Math.acosh, 1), // inverse hyperbolic cosine

            "tan": Solver.wrapMethod(Math.tan, 1), // tangent
            "tanh": Solver.wrapMethod(Math.tanh, 1), // hyperbolic tangent
            "atan": Solver.wrapMethod(Math.floor, 1), // inverse tangent
            "atan2": Solver.wrapMethod(Math.floor, 1), // angle between 0,0 and x,y
            "atanh": Solver.wrapMethod(Math.floor, 1), // inverse hyperbolic tangent

            "log": Solver.wrapMethod(Math.log, 1), // natural logarithm
            "log2": Solver.wrapMethod(Math.log2, 1), // base 2 logarithm
            "log10": Solver.wrapMethod(Math.log10, 1), // base 10 logarithm
            "log1p": Solver.wrapMethod(Math.log1p, 1), // log(1+x)

            "random": Solver.wrapMethods(Math.random, (x: number): number => {
                return Math.random() * x;
            }, 0, 1), // random

            "hypot": Solver.wrapMethod(Math.hypot, "any") // square root of the sum of squares of arguments
        };

        protected static wrapMethod(method: Function, argC: number | "any"): Function {
            return (...args: any) => {
                if (arguments.length == argC || argC == "any") {
                    method(args);
                } else {
                    throw new Error("Incorrect number of args");
                }
            }
        }

        protected static wrapMethods(method1: Function, method2: Function, arg1C: number, arg2C: number | "any"): Function {
            return (...args: any) => {
                if (arguments.length == arg1C) {
                    method1(args);
                } else if (arguments.length == arg2C || arg2C == "any") {
                    method2(args);
                } else {
                    throw new Error("Incorrect number of args");
                }
            }
        }

        protected tree: Elements.ParsedTree;

        public constructor(tree: Elements.ParsedTree) {
            this.tree = tree;
        }

        public solve(): number {
            if (this.tree.children.length == 0) { // Empty equation
                return 0;
            }

            for (let pointer = 0; pointer < this.tree.children.length; pointer++) { // Parse parenthesis
                if (this.tree.children[pointer] instanceof Elements.ParsedTree) {
                    let childTree = this.tree.children[pointer] as Elements.ParsedTree;

                    let solver: Solver = new Solver(childTree);
                    this.tree.children[pointer] = new Elements.ParsedFloat("()", solver.solve());
                } else if (this.tree.children[pointer] instanceof Elements.ParsedFunction) {
                    let childTree = this.tree.children[pointer] as Elements.ParsedFunction;

                    for (let pointer = 0; pointer < childTree.args.length; pointer++) { // Parse parenthesis
                        if (childTree.args[pointer] instanceof Elements.ParsedTree) {
                            let subChildTree = childTree.args[pointer] as Elements.ParsedTree;

                            let solver: Solver = new Solver(subChildTree);
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
                        let operation = this.tree.children[pointer] as Elements.ParsedOperation;

                        if (n1 instanceof Elements.ParsedNumber && n2 instanceof Elements.ParsedNumber) {
                            if (operations.includes(operation.constructor.name)) {
                                if (operation instanceof Elements.ParsedPlus) {
                                    this.tree.children[pointer - 1] = new Elements.ParsedFloat(n1.raw + " " + operation.raw + " " + n2.raw, n1.number + n2.number);
                                    this.tree.children.splice(pointer, 2);
                                    pointer--;
                                } else if (operation instanceof Elements.ParsedMinus) {
                                    this.tree.children[pointer - 1] = new Elements.ParsedFloat(n1.raw + " " + operation.raw + " " + n2.raw, n1.number - n2.number);
                                    this.tree.children.splice(pointer, 2);
                                    pointer--;
                                } else if (operation instanceof Elements.ParsedTimes) {
                                    this.tree.children[pointer - 1] = new Elements.ParsedFloat(n1.raw + " " + operation.raw + " " + n2.raw, n1.number * n2.number);
                                    this.tree.children.splice(pointer, 2);
                                    pointer--;
                                } else if (operation instanceof Elements.ParsedDivide) {
                                    this.tree.children[pointer - 1] = new Elements.ParsedFloat(n1.raw + " " + operation.raw + " " + n2.raw, n1.number / n2.number);
                                    this.tree.children.splice(pointer, 2);
                                    pointer--;
                                } else if (operation instanceof Elements.ParsedExponent) {
                                    this.tree.children[pointer - 1] = new Elements.ParsedFloat(n1.raw + " " + operation.raw + " " + n2.raw, n1.number ** n2.number);
                                    this.tree.children.splice(pointer, 2);
                                    pointer--;
                                } else if (operation instanceof Elements.ParsedModulo) {
                                    this.tree.children[pointer - 1] = new Elements.ParsedFloat(n1.raw + " " + operation.raw + " " + n2.raw, n1.number % n2.number);
                                    this.tree.children.splice(pointer, 2);
                                    pointer--;
                                }
                            }
                        } else {
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
            } else {
                throw new Error("Syntax error (Missing numbers)");
            }
        }
    }

    export class Instance {
        protected rootElement: HTMLDivElement;

        protected inputElement: HTMLInputElement;
        protected outputElement: HTMLSpanElement;

        public constructor() {
            this.rootElement = document.querySelector("#calculator") as HTMLDivElement;

            this.inputElement = this.rootElement.querySelector(".calculator_input") as HTMLInputElement;
            this.outputElement = this.rootElement.querySelector(".calculator_output") as HTMLSpanElement;
        }

        public init(): void {
            this.inputElement.addEventListener("keydown", (event: KeyboardEvent): void => {
                let key: string = event.key.toLowerCase();

                if (key === "enter") {
                    this.calculate();
                }
            });

            this.calculate();
        }

        public calculate(): void {
            try {
                console.log("Input", this.inputElement.value);

                let parser: Parser = new Parser(this.inputElement.value);
                let tree: Elements.ParsedTree = parser.parse();

                console.log("Parsed", JSON.stringify(tree, null, 2));

                let solver: Solver = new Solver(tree);
                let result: number = solver.solve();

                console.log("Solved", result.toString());

                this.outputElement.innerText = result.toString();
            } catch (e: any) {
                this.outputElement.innerText = "ERR";

                console.warn(e);
            }
        }
    }

    type OrderOfOperationsMode = "correct" | "simple";
    export class Settings {
        static parenthesisEnabled: boolean = true;
        static functionsEnabled: boolean = true;
        static orderOfOperationsMode: OrderOfOperationsMode = "correct";
    }
}
window.Calculator = Calculator;

let instance = new Calculator.Instance();
instance.init();