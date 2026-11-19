import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { presentAddExpenseSheet } from '../src/lib/addExpenseSheet';

export default function AddExpenseRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.back();
    presentAddExpenseSheet();
  }, []);
  return null;
}
