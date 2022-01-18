export class Thing {

    static {
        Object.setPrototypeOf(Thing.prototype, null);
        Object.freeze(Thing.prototype);
    }

}