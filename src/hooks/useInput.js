import { useState } from 'react';

/** Pola dari Modul Praktikum P4: mengikat nilai input ke state lokal. */
function useInput(defaultValue = '') {
  const [value, setValue] = useState(defaultValue);
  const onValueChangeHandler = (event) => setValue(event.target.value);
  return [value, onValueChangeHandler, setValue];
}

export default useInput;
