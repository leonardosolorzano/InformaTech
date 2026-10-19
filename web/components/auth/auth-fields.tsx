import { Field } from "@/components/shared/field";
import { inputClassName } from "@/lib/styles";

interface AuthFieldsProps {
  isRegister: boolean;
}

/**
 * Campos del formulario de auth. Son controlados por `FormData` del formulario
 * padre (no guardan estado propio): solo cambian qué campos se muestran.
 */
export function AuthFields({ isRegister }: AuthFieldsProps) {
  return (
    <>
      {isRegister ? (
        <>
          <Field
            htmlFor="full_name"
            label={
              <>
                Nombre{" "}
                <span className="font-normal text-[#77776f]">(opcional)</span>
              </>
            }
          >
            <input
              id="full_name"
              name="full_name"
              type="text"
              autoComplete="name"
              maxLength={100}
              placeholder="María García"
              className={inputClassName}
            />
          </Field>

          <Field htmlFor="username" label="Nombre de usuario">
            <input
              id="username"
              name="username"
              type="text"
              autoComplete="username"
              minLength={3}
              maxLength={30}
              pattern="[A-Za-z0-9_]+"
              title="Usa de 3 a 30 letras, números o guiones bajos."
              required
              placeholder="maria_garcia"
              className={inputClassName}
            />
          </Field>
        </>
      ) : (
        <Field htmlFor="identifier" label="Correo electrónico o usuario">
          <input
            id="identifier"
            name="identifier"
            type="text"
            autoComplete="username"
            autoCapitalize="none"
            autoCorrect="off"
            required
            placeholder="tu@email.com o tu_usuario"
            className={inputClassName}
          />
        </Field>
      )}

      {isRegister && (
        <Field htmlFor="email" label="Correo electrónico">
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            autoCapitalize="none"
            autoCorrect="off"
            required
            placeholder="nombre@ejemplo.com"
            className={inputClassName}
          />
        </Field>
      )}

      <Field
        htmlFor="password"
        label="Contraseña"
        hint={
          isRegister
            ? "Usa al menos 8 caracteres, una letra y un número."
            : undefined
        }
      >
        <input
          id="password"
          name="password"
          type="password"
          autoComplete={isRegister ? "new-password" : "current-password"}
          minLength={isRegister ? 8 : undefined}
          maxLength={128}
          pattern={
            isRegister ? "(?=.*[A-Za-z])(?=.*[0-9]).{8,128}" : undefined
          }
          title={
            isRegister
              ? "Debe tener al menos 8 caracteres, una letra y un número."
              : undefined
          }
          required
          placeholder={isRegister ? "Mínimo 8 caracteres" : "Tu contraseña"}
          className={inputClassName}
        />
      </Field>
    </>
  );
}
