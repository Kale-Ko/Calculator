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