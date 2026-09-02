import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { Layers, UserPlus } from 'lucide-react';
import { Button } from '../../../shared/components/Button';
import { useAuth } from '../hooks/useAuth';
import styles from './AuthLayout.module.css';

const registerSchema = z.object({
  fullname: z
    .string()
    .min(3, 'Full name must be at least 3 characters')
    .max(30, 'Full name must be at most 30 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type RegisterFormData = z.infer<typeof registerSchema>;

export const RegisterForm: React.FC = () => {
  const { register: registerAuth, isRegistering } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    try {
      await registerAuth(data);
      navigate('/');
    } catch {
      // Error handled by mutation toast
    }
  };

  return (
    <div className={styles.authWrapper}>
      <div className={styles.authCard}>
        <div className={styles.header}>
          <div className={styles.brandLogo}>
            <Layers size={28} />
            <span>QueueForge</span>
          </div>
          <p className={styles.subtitle}>Create an account to start managing job workflows</p>
        </div>

        <form className={styles.form} onSubmit={handleSubmit(onSubmit)}>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="fullname">
              Full Name
            </label>
            <input
              id="fullname"
              type="text"
              placeholder="Nitish Palyal"
              className={`${styles.input} ${errors.fullname ? styles.inputError : ''}`}
              {...register('fullname')}
            />
            {errors.fullname && <span className={styles.errorMessage}>{errors.fullname.message}</span>}
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="email">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              placeholder="user@example.com"
              className={`${styles.input} ${errors.email ? styles.inputError : ''}`}
              {...register('email')}
            />
            {errors.email && <span className={styles.errorMessage}>{errors.email.message}</span>}
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              placeholder="••••••••"
              className={`${styles.input} ${errors.password ? styles.inputError : ''}`}
              {...register('password')}
            />
            {errors.password && <span className={styles.errorMessage}>{errors.password.message}</span>}
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            isLoading={isRegistering}
            leftIcon={<UserPlus size={18} />}
          >
            Create Account
          </Button>
        </form>

        <div className={styles.footer}>
          Already have an account?
          <Link to="/login" className={styles.link}>
            Sign in
          </Link>
        </div>
      </div>
    </div>
  );
};
