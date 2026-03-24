import { useMemo, useState } from 'react'
import { Button } from '../ui/Button'
import { Card } from '../ui/Card'
import { FormError } from '../ui/FormError'
import { FormField } from '../ui/FormField'
import { QueryStatusBanner } from '../ui/QueryStatusBanner'
import {
  useAssignResourceService,
  useResourceServices,
  useServices,
} from '../../hooks'
import { extractServerError } from '../../lib/errors'
import { formatPrice, inputSelectClass } from './resourceDetailUtils'

export function ResourceServicesSection({ resourceId }: { resourceId: string }) {
  const { data: assignments, isPending, isError, error } = useResourceServices(resourceId)
  const {
    data: allServices,
    isPending: servicesPending,
    isError: servicesError,
    error: servicesQueryError,
  } = useServices()
  const assignMutation = useAssignResourceService(resourceId)

  const [serviceId, setServiceId] = useState('')
  const [price, setPrice] = useState('')
  const [durationOverride, setDurationOverride] = useState('')
  const [formError, setFormError] = useState<string | undefined>()

  const tenantServicesOrdered = useMemo(() => {
    const list = [...(allServices ?? [])]
    list.sort((a, b) => {
      if (a.sortOrder !== b.sortOrder) return a.sortOrder - b.sortOrder
      return a.name.localeCompare(b.name)
    })
    return list
  }, [allServices])

  const assignedServiceIds = useMemo(
    () => new Set((assignments ?? []).map((a) => a.serviceId)),
    [assignments]
  )

  const resetForm = () => {
    setServiceId('')
    setPrice('')
    setDurationOverride('')
    setFormError(undefined)
    assignMutation.reset()
  }

  const onAssign = async () => {
    setFormError(undefined)
    if (!serviceId) {
      setFormError('Select a service')
      return
    }
    if (assignedServiceIds.has(serviceId)) {
      setFormError('This service is already assigned to this resource')
      return
    }
    const priceNum = Number.parseFloat(price)
    if (Number.isNaN(priceNum) || priceNum < 0) {
      setFormError('Enter a valid price (0 or greater)')
      return
    }
    let duration: number | undefined
    if (durationOverride.trim()) {
      const d = Number.parseInt(durationOverride, 10)
      if (Number.isNaN(d) || d <= 0) {
        setFormError('Duration override must be a positive whole number of minutes')
        return
      }
      duration = d
    }
    try {
      await assignMutation.mutateAsync({
        serviceId,
        price: priceNum,
        ...(duration != null ? { durationOverride: duration } : {}),
      })
      resetForm()
    } catch (err: unknown) {
      setFormError(extractServerError(err) ?? 'Could not assign service')
    }
  }

  return (
    <Card className="flex flex-col gap-4 p-6">
      <h2 className="text-lg font-medium text-[var(--text-h)]">Services for this resource</h2>
      <p className="text-sm text-[var(--text)]">
        Assign salon services and set the price this resource charges for each.
      </p>

      <QueryStatusBanner
        isPending={isPending}
        isError={isError}
        error={error}
        loadingText="Loading assigned services…"
      />

      {!isPending && !isError && (
        <>
          <QueryStatusBanner
            isPending={servicesPending}
            isError={servicesError}
            error={servicesQueryError}
            loadingText="Loading tenant services…"
          />

          <div className="overflow-x-auto rounded border border-[var(--border)]">
            <table className="w-full min-w-[480px] border-collapse text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] bg-[var(--code-bg)]">
                  <th className="px-3 py-2 text-left font-medium text-[var(--text-h)]">Service</th>
                  <th className="px-3 py-2 text-left font-medium text-[var(--text-h)]">Duration</th>
                  <th className="px-3 py-2 text-left font-medium text-[var(--text-h)]">Price</th>
                  <th className="px-3 py-2 text-left font-medium text-[var(--text-h)]">Active</th>
                </tr>
              </thead>
              <tbody>
                {(assignments ?? []).length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-3 py-6 text-center text-[var(--text)]">
                      No services assigned yet.
                    </td>
                  </tr>
                ) : (
                  (assignments ?? []).map((a) => (
                    <tr key={a.id} className="border-b border-[var(--border)] last:border-b-0">
                      <td className="px-3 py-2 text-[var(--text-h)]">{a.service.name}</td>
                      <td className="px-3 py-2 text-[var(--text)]">
                        {a.durationOverride ?? a.service.durationMinutes} min
                      </td>
                      <td className="px-3 py-2 text-[var(--text)]">{formatPrice(a.price)}</td>
                      <td className="px-3 py-2 text-[var(--text)]">{a.isActive ? 'Yes' : 'No'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {!servicesPending && !servicesError && tenantServicesOrdered.length > 0 ? (
            <div className="flex flex-col gap-3 border-t border-[var(--border)] pt-4">
              <p className="text-sm font-medium text-[var(--text-h)]">
                {(assignments ?? []).length === 0 ? 'Assign a service' : 'Assign another service'}
              </p>
              <p className="text-xs text-[var(--text)]">
                All services for your salon are listed below. Already assigned ones are disabled.
              </p>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <div>
                  <label htmlFor="assign-service" className="mb-1 block text-sm text-[var(--text)]">
                    Service
                  </label>
                  <select
                    id="assign-service"
                    className={inputSelectClass}
                    value={serviceId}
                    onChange={(e) => setServiceId(e.target.value)}
                  >
                    <option value="">Select…</option>
                    {tenantServicesOrdered.map((s) => {
                      const taken = assignedServiceIds.has(s.id)
                      return (
                        <option key={s.id} value={s.id} disabled={taken}>
                          {s.name} ({s.durationMinutes} min)
                          {taken ? ' — already assigned' : ''}
                        </option>
                      )
                    })}
                  </select>
                </div>
                <FormField
                  label="Price"
                  type="text"
                  inputMode="decimal"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="e.g. 25.00"
                />
                <FormField
                  label="Duration override (optional)"
                  type="number"
                  min={1}
                  value={durationOverride}
                  onChange={(e) => setDurationOverride(e.target.value)}
                  placeholder="Minutes"
                />
                <div className="flex items-end">
                  <Button
                    type="button"
                    className="w-full sm:w-auto"
                    disabled={
                      assignMutation.isPending ||
                      !serviceId ||
                      assignedServiceIds.has(serviceId)
                    }
                    onClick={() => void onAssign()}
                  >
                    {assignMutation.isPending ? 'Assigning…' : 'Assign'}
                  </Button>
                </div>
              </div>
              <FormError message={formError} />
            </div>
          ) : !servicesPending && !servicesError ? (
            <p className="text-sm text-[var(--text)]">
              {tenantServicesOrdered.length === 0
                ? 'Create services under your tenant before assigning them here.'
                : null}
            </p>
          ) : null}
        </>
      )}
    </Card>
  )
}
