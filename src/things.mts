import {Order} from "./order.mjs";
import {HashOf} from "./hashof.mjs";

export interface Things<T> extends Order<T>,  HashOf<T> {
}