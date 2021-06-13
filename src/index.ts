import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

interface CurrentState<S> {
  value$: Observable<S[keyof S]>;

  value(): S[keyof S];
}

interface Settable<S> {
  set(value: S[keyof S]): void;
}

interface Resettable {
  reset(): void;
}

interface Releasable {
  release(): void;
}

type KeysToObservableMapper<State> = {
  readonly [K in Extract<keyof State,
    string> as `${Lowercase<K>}$`]: Observable<boolean>;
};

export type ReactiveEnum<S> = KeysToObservableMapper<S> &
  Settable<S> &
  CurrentState<S> &
  Resettable &
  Releasable;

type Enum<E> = Record<keyof E, E[keyof E]>;

interface Transition<State> {
  when: Observable<unknown>;
  become: State[keyof State];
}

/**
 * TODO: add support for reactive transitions
 */
// @ts-ignore
interface Transitions<State> {
  transitions?: {
    [K in Extract<keyof State, string>]?: Transition<State>;
  };
}

interface Config<State> {
  initialValue?: State[keyof State];
}

type ConfigParam<State> = State[keyof State] | Config<State>;

/**
 *
 * This is a small utility that converts an enum into a reactive state
 * container
 *
 * Given he enum Status, we can feed it to the {@link reactiveEnum} function
 *
 * enum Status {
 *   Initial,
 *   Processing
 * }
 *
 * const state = reactiveEnum(Status);
 *
 * we can now use methods' based on the enum's values such as:
 * - state.value$.subscribe to subscribe to its value changes
 * - state.initial$.subscribe to subscribe to if the value is "Initial"
 * - state.set(Status.Initial) will update the enum's value
 *
 * @param state
 * @param config
 */
export function reactiveEnum<State extends Enum<State>>(
  state: State,
  config: ConfigParam<State> = {},
): ReactiveEnum<State> {
  const initialValue = isConfigObject<State>(config)
    ? (config as Config<State>).initialValue
    : config;

  const state$ = new BehaviorSubject<State | undefined>(initialValue);
  const container: Partial<ReactiveEnum<State>> = {};

  for (const key in state) {
    const property = `${key.toLowerCase()}$`;

    Object.assign(container, {
      [property]: state$.pipe(
        map((value) => {
          return value === state[key];
        }),
      ),
    });
  }

  Object.assign(container, {
    set: (value: State) => state$.next(value),
  });

  Object.assign(container, {
    reset: () => state$.next(initialValue),
  });

  Object.assign(container, {
    release: () => state$.unsubscribe(),
  });

  Object.assign(container, {
    value$: state$.asObservable(),
    value: () => state$.getValue(),
  });

  return container as ReactiveEnum<State>;
}

function isConfigObject<T>(config: ConfigParam<T>): config is Config<T> {
  return Object(config) === config;
}
