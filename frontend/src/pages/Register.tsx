import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Link } from "react-router-dom";
import { Zap, UserPlus } from "lucide-react";
import { motion } from "framer-motion";
import { Input } from "../components/ui/FormFields";
import { Button } from "../components/ui/Button";
import { useRegister } from "../hooks/auth";

const schema = z.object({
  name: z.string().min(1, "Ingresá tu nombre").max(100),
  email: z.string().email("Email inválido"),
  password: z
    .string()
    .min(6, "La contraseña debe tener al menos 6 caracteres")
    .max(100),
});

type FormData = z.infer<typeof schema>;

export const RegisterPage = () => {
  const mutation = useRegister();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = (data: FormData) => mutation.mutate(data);

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-sm"
      >
        {/* Logo */}
        <div className="flex flex-col items-center gap-3 mb-8">
          <div className="p-3 bg-indigo-600/20 rounded-2xl border border-indigo-500/20">
            <Zap size={28} className="text-indigo-400" />
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-bold text-slate-100 tracking-tight">
              TimePipeline
            </h1>
            <p className="text-sm text-slate-500 mt-1">Creá tu cuenta personal</p>
          </div>
        </div>

        {/* Form card */}
        <div className="bg-white/3 border border-white/10 rounded-2xl p-6 flex flex-col gap-5">
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <Input
              label="Nombre"
              type="text"
              placeholder="Tu nombre"
              autoComplete="name"
              error={errors.name?.message}
              {...register("name")}
            />
            <Input
              label="Email"
              type="email"
              placeholder="tu@email.com"
              autoComplete="email"
              error={errors.email?.message}
              {...register("email")}
            />
            <Input
              label="Contraseña"
              type="password"
              placeholder="Mínimo 6 caracteres"
              autoComplete="new-password"
              error={errors.password?.message}
              {...register("password")}
            />

            {mutation.isError && (
              <p className="text-sm text-rose-400 bg-rose-500/10 rounded-xl px-4 py-3 border border-rose-500/20">
                {(mutation.error as any)?.response?.data?.detail ??
                  "Ocurrió un error. Intentá de nuevo."}
              </p>
            )}

            <Button
              type="submit"
              variant="primary"
              loading={mutation.isPending}
              icon={<UserPlus size={16} />}
              className="w-full mt-1"
            >
              Crear cuenta
            </Button>
          </form>

          {/* What you get on register */}
          <div className="bg-indigo-500/5 border border-indigo-500/15 rounded-xl px-4 py-3">
            <p className="text-xs text-indigo-400 font-medium mb-1.5">
              Al registrarte obtenés:
            </p>
            <ul className="text-xs text-slate-500 flex flex-col gap-1">
              <li>🎓 Categorías preconfiguradas (Facultad, Trabajo, etc.)</li>
              <li>📅 Calendario personal exclusivo</li>
              <li>🔒 Tus datos son privados y solo tuyos</li>
            </ul>
          </div>

          <div className="text-center border-t border-white/8 pt-4">
            <p className="text-sm text-slate-500">
              ¿Ya tenés cuenta?{" "}
              <Link
                to="/login"
                className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
              >
                Iniciá sesión
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
