# Strech Box

A native JS component library that automatically detects elements and implements cascading drags within containers.

## Example

```js
const sbox = new StrechBox(document.querySelector("#app"), {
    direction: "row",
    items: [
        {
            initialProportion: 0.2,
            minWidth: 100,
        },
        {
            initialProportion: 0.8,
            minWidth: 400,
        },
    ],
});
```

## Preview
