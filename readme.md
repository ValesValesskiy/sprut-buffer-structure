<br>
<br>
<p align="center"><img src="./icon.svg" width="150"></p>
<br>
<br>

```
> npm i sprut-buffer-structure
```

# Sprut-buffer-structure

<span style="color: #cc5555">Инструмент тестируется и будет дописываться или переписываться.</span>

<span style="color: #cc5555">На данный момент значения переводятся в буфферы математическими расчётами.</span>

<span style="color: #cc5555">В будущем, для типичных размеров типа, это может измениться.</span>

---

Создаётся для собственных нужд и используется как зависимость в собственных пакетах.
Будет использоваться для перевода объектов или примитивов в буфферы и шаринга между процессами данного буфера, с возможностью перевести обратно в те же структуры внутри процессов.
Также для пересылки буферов по сетевым сокетам в обход JSON.parse, JSON.stringify и HTTP и подобных ему протоколов.
Делается с мыслями о том, что это будет быстрее работать.

---

Инструмент для перевода текстовых данных заданной и динамической длины, численных значений заданной длины, массивов и объектов в буферы.
Также может использоваться для перевода чисел в другие системы счиления с заданным основанием. Перевод в байти происходит с заданием основания ```256```.

---

<br>

## <span id="contents">Оглавление</span>

- [Использование генератора класса сообщений](#messageClass)
- [Использование утилитных методов](#utils)

<br>

## <span id="messageClass">Использование генератора класса сообщений:</span>

- [К оглавлению](#contents)

<br>

```js
const { MessageClass, MessageTypesAlias } = require('sprut-buffer-structure');

const SomeBufferMessage = MessageClass<number, string>(
    {
        dataTypes: [
            VarTypes.Number(2),
            VarTypes.String(MessageTypesAlias.dynamic),
        ],
        dynamicLengthLabelBytes: 2
    }
);

let msg = new SomeBufferMessage(100, '10');
console.log(msg.toBuffer()); // <Buffer 00 64 00 02 31 30>
console.log(msg.toBuffer().byteLength); // 6
```

<br>

## <span id="utils">Использование утилитных методов:</span>

- [К оглавлению](#contents)

<br>

```js
...
```

Описаны не все особенности. Некоторое из неописанного, возможно, будет выпилено.