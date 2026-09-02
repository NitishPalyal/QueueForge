import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { Layers, LogIn } from 'lucide-react';
import { Button } from '../../../shared/components/Button';
import { useAuth } from '../hooks/useAuth';
import styles from './AuthLayout.module.css';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export const LoginForm: React.FC = () => {
  const { login, isLoggingIn } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      await login(data);
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
          <p className={styles.subtitle}>Sign in to access your distributed job queues</p>
        </div>

        <form className={styles.form} onSubmit={handleSubmit(onSubmit)}>
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

          <Button type="submit" variant="primary" size="lg" isLoading={isLoggingIn} leftIcon={<LogIn size={18} />}>
            Sign In
          </Button>
        </form>

        <div className={styles.footer}>
          Don't have an account?
          <Link to="/register" className={styles.link}>
            Create one
          </Link>
        </div>
      </div>
    </div>
  );
};
