import { FormInput } from './form-input/form-input';
import { FormTextarea } from './form-textarea/form-textarea';
import { FormSelect } from './form-select/form-select';

export const FormComponents = [
  FormInput,
  FormTextarea,
  FormSelect,
] as const;

export { FormInput, FormTextarea, FormSelect };
