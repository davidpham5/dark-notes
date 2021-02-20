import {useState} from 'react'

export function useFormFields (iniState) {
  const [fields, setFields] = useState(iniState);

  return [
    fields,
    function (event) {
      setFields({
        ...fields,
        [event.target.id]: event.target.value
      })
    }
  ]
}