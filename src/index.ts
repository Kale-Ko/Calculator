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

            public constructor() {
                super();

                this.children = [];
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
            let tree: Elements.ParsedTree = new Elements.ParsedTree();

            while (this.hasNext()) {
                let char: string = this.readNext();
                let charCode: number = char.charCodeAt(0);

                if (charCode <= 32) { // Invisible character / space / newline
                    continue;
                }

                if ((charCode >= 48 && charCode <= 57) || charCode === 46) { // Number, decimal point
                    let num = char;
                    let isFloat = false;

                    while (this.hasNext()) {
                        let nextChar = this.peekNext();
                        let nextCharCode: number = nextChar.charCodeAt(0);

                        if ((nextCharCode >= 48 && nextCharCode <= 57) || nextCharCode === 46) {
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
                    throw new Error("Invalid/unknown character");
                }
            }

            console.log(JSON.stringify(tree.children, null, 2));

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
        protected static ORDER_OF_OPERATIONS: string[][] = [[Elements.ParsedExponent.name], [Elements.ParsedTimes.name], [Elements.ParsedDivide.name], [Elements.ParsedModulo.name], [Elements.ParsedPlus.name], [Elements.ParsedMinus.name]];
        protected static ORDER_OF_OPERATIONS_CORRECT: string[][] = [[Elements.ParsedExponent.name], [Elements.ParsedTimes.name, Elements.ParsedDivide.name, Elements.ParsedModulo.name], [Elements.ParsedPlus.name, Elements.ParsedMinus.name]];

        protected tree: Elements.ParsedTree;

        public constructor(tree: Elements.ParsedTree) {
            this.tree = tree;
        }

        public solve(): number {
            return this.evaluate(this.tree);
        }

        public evaluate(element: Elements.ParsedTree): number {
            for (let operations of Solver.ORDER_OF_OPERATIONS_CORRECT) {
                for (let pointer = 0; pointer < element.children.length; pointer++) {
                    if (element.children[pointer] instanceof Elements.ParsedOperation) {
                        let n1 = element.children[pointer - 1];
                        let n2 = element.children[pointer + 1];
                        let operation = element.children[pointer] as Elements.ParsedOperation;

                        if (n1 instanceof Elements.ParsedNumber && n2 instanceof Elements.ParsedNumber) {
                            if (operations.includes(operation.constructor.name)) {
                                if (operation instanceof Elements.ParsedPlus) {
                                    element.children[pointer - 1] = new Elements.ParsedFloat(n1.raw + " " + operation.raw + " " + n2.raw, n1.number + n2.number);
                                    element.children.splice(pointer, 2);
                                    pointer--;
                                } else if (operation instanceof Elements.ParsedMinus) {
                                    element.children[pointer - 1] = new Elements.ParsedFloat(n1.raw + " " + operation.raw + " " + n2.raw, n1.number - n2.number);
                                    element.children.splice(pointer, 2);
                                    pointer--;
                                } else if (operation instanceof Elements.ParsedTimes) {
                                    element.children[pointer - 1] = new Elements.ParsedFloat(n1.raw + " " + operation.raw + " " + n2.raw, n1.number * n2.number);
                                    element.children.splice(pointer, 2);
                                    pointer--;
                                } else if (operation instanceof Elements.ParsedDivide) {
                                    element.children[pointer - 1] = new Elements.ParsedFloat(n1.raw + " " + operation.raw + " " + n2.raw, n1.number / n2.number);
                                    element.children.splice(pointer, 2);
                                    pointer--;
                                } else if (operation instanceof Elements.ParsedExponent) {
                                    element.children[pointer - 1] = new Elements.ParsedFloat(n1.raw + " " + operation.raw + " " + n2.raw, n1.number ** n2.number);
                                    element.children.splice(pointer, 2);
                                    pointer--;
                                } else if (operation instanceof Elements.ParsedModulo) {
                                    element.children[pointer - 1] = new Elements.ParsedFloat(n1.raw + " " + operation.raw + " " + n2.raw, n1.number % n2.number);
                                    element.children.splice(pointer, 2);
                                    pointer--;
                                } else {
                                    throw new Error("Unknown operation");
                                }
                            }
                        } else {
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
        }

        public calculate(): void {
            try {
                let parser = new Parser(this.inputElement.value);

                let tree: Elements.ParsedTree = parser.parse();
                let solver = new Solver(tree);

                let result: number = solver.solve();

                this.outputElement.innerText = result.toString();
            } catch (e: any) {
                this.outputElement.innerText = "ERR";

                console.warn(e);
            }
        }
    }
}
window.Calculator = Calculator;

let instance = new Calculator.Instance();
instance.init();

instance.calculate();