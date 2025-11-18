import { FormInput } from './form-input/form-input';
import { FormTextarea } from './form-textarea/form-textarea';
import { FormSelect } from './form-select/form-select';
import { FormCheckbox } from './form-checkbox/form-checkbox';

export const FormComponents = [
  FormInput,
  FormTextarea,
  FormSelect,
  FormCheckbox,
] as const;

export { FormInput, FormTextarea, FormSelect, FormCheckbox };
