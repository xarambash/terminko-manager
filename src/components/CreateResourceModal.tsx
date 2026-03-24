import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from 'react-router-dom'
import { z } from 'zod'
import { Button } from './ui/Button'
import { FormError } from './ui/FormError'
import { FormField } from './ui/FormField'
import { Modal } from './ui/Modal'
import { useCreateResource } from '../hooks'
import { extractServerError } from '../lib/errors'
import type { CreateResourceModalProps } from '../types'

const createResourceSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().min(1, 'Email is required').email('Invalid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  phone: z.string().optional(),
  profilePicture: z.string().optional(),
})

type CreateResourceForm = z.infer<typeof createResourceSchema>

export function CreateResourceModal({ open, onClose }: CreateResourceModalProps) {
  const navigate = useNavigate()
  const createMutation = useCreateResource()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<CreateResourceForm>({
    resolver: zodResolver(createResourceSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      phone: '',
      profilePicture: '',
    },
  })

  const closeModal = () => {
    onClose()
    reset()
    createMutation.reset()
  }

  const onSubmit = async (data: CreateResourceForm) => {
    try {
      const created = await createMutation.mutateAsync({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        password: data.password,
        ...(data.phone?.trim() && { phone: data.phone.trim() }),
        ...(data.profilePicture?.trim() && {
          profilePicture: data.profilePicture.trim(),
        }),
      })
      closeModal()
      navigate(`/resources/${created.id}`)
    } catch (err: unknown) {
      setError('root', {
        message: extractServerError(err) ?? 'Could not create resource',
      })
    }
  }

  return (
    <Modal
      open={open}
      onClose={closeModal}
      title="New resource"
      titleId="resource-modal-title"
    >
      <p className="mb-4 text-sm text-[var(--text)]">
        Creates a staff login for this person. They can sign in with the email
        and password you set here.
      </p>
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <FormField
          label="First name"
          {...register('firstName')}
          error={errors.firstName?.message}
        />
        <FormField
          label="Last name"
          {...register('lastName')}
          error={errors.lastName?.message}
        />
        <FormField
          label="Email"
          type="email"
          autoComplete="off"
          {...register('email')}
          error={errors.email?.message}
        />
        <FormField
          label="Password"
          type="password"
          autoComplete="new-password"
          {...register('password')}
          error={errors.password?.message}
        />
        <FormField
          label="Phone (optional)"
          {...register('phone')}
          error={errors.phone?.message}
        />
        <FormField
          label="Profile picture URL (optional)"
          {...register('profilePicture')}
          error={errors.profilePicture?.message}
        />
        <FormError
          message={
            errors.root?.message ??
            (createMutation.isError
              ? extractServerError(createMutation.error)
              : undefined)
          }
        />
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="secondary" onClick={closeModal}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Creating…' : 'Create'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
