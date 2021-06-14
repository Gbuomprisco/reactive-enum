---

# Reactive Enum

### A tool to automatically generate a typed reactive enum with Rx

Not yet production ready.

## Install

```bash
npm i @ngbites/reactive-enum
```

## Usage

This utility is particularly useful with framework such as Angular to 
automatically generate a set of reactive streams, so that you can use them 
in your template effortlessly.

This basically replaces using a `BehaviorSubject` property followed by auxiliary 
methods such as:

```typescript
import { BehaviorSubject } from 'rxjs';

class MyComponent {
  private readonly status$ = new BehaviorSubject<Status>(Status.Initial);
  
  private readonly initial$ = this.status$.pipe(map(status => status === 
    Status.Initial));
  
  private readonly pending$ = this.status$.pipe(map(status => status ===
    Status.Pending));
}

```

### Basic Usage

```typescript
// declare an enum
enum Status {
  Initial,
  Pending,
  Success,
  Error
}

// pass your enum to "reactiveEnum"
const status = reactiveEnum(Status);

// "status" has now autmatically generated a method for each value of the enum
status.initial$.subscribe(); // false ... // true
status.pending$.subscribe(); // false
status.success$.subscribe(); // false
status.error$.subscribe(); // false

status.set(Status.Initial);
```

### Passing an initial value
```typescript
const status = reactiveEnum(Status, {
  initialValue: Status.Initial,
});

status.value$.subscribe(console.log); // Status.Initial
```

### Updating the value
```typescript
const status = reactiveEnum(Status);

status.value$.subscribe(console.log); // Status.Success

status.set(Status.Success);
```

### Resetting to the original value
```typescript
const status = reactiveEnum(Status, {
  initialValue: Status.Initial
});

status.value$.subscribe(console.log); 
// 1. Status.Initial
// 2. Status.Success
// 3. Status.Initial

status.set(Status.Success);
status.reset();
```


