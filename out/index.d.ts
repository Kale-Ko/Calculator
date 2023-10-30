declare namespace Calculator {
    export namespace Elements {
        class ParsedElement {
            protected constructor();
        }
        class ParsedToken {
            raw: string;
            protected constructor(raw: string);
        }
        class ParsedNumber extends ParsedToken {
            number: number;
            protected constructor(raw: string, number: number);
        }
        class ParsedInteger extends ParsedNumber {
            constructor(raw: string, number: number);
        }
        class ParsedFloat extends ParsedNumber {
            constructor(raw: string, number: number);
        }
        class ParsedOperation extends ParsedToken {
            protected constructor(raw: string);
        }
        class ParsedPlus extends ParsedOperation {
            constructor(raw: string);
        }
        class ParsedMinus extends ParsedOperation {
            constructor(raw: string);
        }
        class ParsedTimes extends ParsedOperation {
            constructor(raw: string);
        }
        class ParsedDivide extends ParsedOperation {
            constructor(raw: string);
        }
        class ParsedExponent extends ParsedOperation {
            constructor(raw: string);
        }
        class ParsedModulo extends ParsedOperation {
            constructor(raw: string);
        }
        class ParsedTree extends ParsedElement {
            children: ParsedElement[];
            constructor(children: ParsedElement[]);
        }
        class ParsedFunction extends ParsedElement {
            name: string;
            args: ParsedElement[];
            constructor(name: string, args: ParsedElement[]);
        }
    }
    export class Parser {
        protected string: string;
        protected pointer: number;
        constructor(string: string);
        parse(): Elements.ParsedTree;
        protected hasNext(): boolean;
        protected readNext(): string;
        protected peekNext(): string;
        protected consumeNext(): void;
    }
    export class Solver {
        protected static ORDER_OF_OPERATIONS_CORRECT: string[][];
        protected static ORDER_OF_OPERATIONS_SIMPLE: string[][];
        protected static FUNCTIONS: any;
        protected static wrapMethod(method: Function, argC: number | "any"): Function;
        protected static wrapMethods(method1: Function, method2: Function, arg1C: number, arg2C: number | "any"): Function;
        protected tree: Elements.ParsedTree;
        constructor(tree: Elements.ParsedTree);
        solve(): number;
    }
    export class Instance {
        protected rootElement: HTMLDivElement;
        protected inputElement: HTMLInputElement;
        protected outputElement: HTMLSpanElement;
        constructor();
        init(): void;
        calculate(): void;
    }
    type OrderOfOperationsMode = "correct" | "simple";
    export class Settings {
        static parenthesisEnabled: boolean;
        static functionsEnabled: boolean;
        static orderOfOperationsMode: OrderOfOperationsMode;
    }
    export {};
}
declare let instance: Calculator.Instance;
//# sourceMappingURL=index.d.ts.map