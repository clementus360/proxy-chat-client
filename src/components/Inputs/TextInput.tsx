interface TextInputProps {
    name: string;
    label?: string;
    type: string;
    placeholder: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    errorMessage?: string;
}

export const TextInput: React.FC<TextInputProps> = ({ name, value, type, placeholder, onChange, errorMessage }) => {
    return (
        <div className="flex flex-col gap-2 w-full">
            {/* {label && <label htmlFor={label} className="text-primary">{label}</label>} */}
            <input name={name} value={value} type={type} placeholder={placeholder} onChange={onChange} className="bg-transparent border-text border-[0.1rem] text-white rounded-full placeholder:text-text px-4 py-4" />
            {errorMessage && <p className="text-red-400 text-sm">{errorMessage}</p>}
        </div>
    )
}