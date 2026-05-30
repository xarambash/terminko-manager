import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { notifications } from '@mantine/notifications'
import { ActionIcon, Alert, Avatar, Badge, Button, Group, Loader, Paper, SimpleGrid, Stack, Text, Tooltip } from '@mantine/core'
import { IconAlertCircle, IconTrash } from '@tabler/icons-react'
import {
  CreateResourceModal,
  DeleteResourceConfirmModal,
  PageSectionHeader,
} from '../components'
import { useDeleteResource, useResources } from '../hooks'
import { apiErrorMessageForMutation, formatQueryError } from '../lib/errors'
import type { Resource } from '../types/resources'

function ResourcesPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [modalOpen, setModalOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<Resource | null>(null)

  const { data: resources, isPending, isError, error } = useResources()
  const deleteMutation = useDeleteResource()

  const sorted = useMemo(() => {
    const list = [...(resources ?? [])]
    list.sort((a, b) => `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`))
    return list
  }, [resources])

  return (
    <Stack component="main" maw="1500px" mx="auto" w="100%" gap="lg">
      <PageSectionHeader
        title={t('resources.title')}
        actions={
          <Button onClick={() => setModalOpen(true)}>{t('resources.createResource')}</Button>
        }
      />

      {isPending && <Group justify="center"><Loader size="sm" /></Group>}
      {isError && (
        <Alert icon={<IconAlertCircle size={16} />} color="red" variant="light">
          {formatQueryError(error)}
        </Alert>
      )}

      {!isPending && !isError && (
        sorted.length === 0 ? (
          <Text c="dimmed" size="sm">{t('resources.empty')}</Text>
        ) : (
          <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="sm">
            {sorted.map((r) => (
              <Paper
                key={r.id}
                withBorder
                p="md"
                radius="md"
                style={{ cursor: 'pointer' }}
                onClick={() => navigate(`/resources/${r.id}`)}
              >
                <Group gap="md" align="flex-start" wrap="nowrap">
                  <Avatar
                    src={r.profilePicture}
                    alt={`${r.firstName} ${r.lastName}`}
                    size={56}
                  />
                  <Stack gap={4} flex={1} style={{ minWidth: 0 }}>
                    <Group justify="space-between" wrap="nowrap" gap="xs">
                      <Text fw={500} size="sm" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {r.firstName} {r.lastName}
                      </Text>
                      <Group gap="xs" style={{ flexShrink: 0 }}>
                        <Badge color={r.isActive ? 'green' : 'gray'} variant="light" size="sm">
                          {r.isActive ? t('common.active') : t('common.inactive')}
                        </Badge>
                        <Tooltip label={t('resources.delete')} withArrow>
                          <ActionIcon
                            variant="outline"
                            color="red"
                            size="sm"
                            onClick={(e) => { e.stopPropagation(); setDeleteTarget(r) }}
                            aria-label={t('resources.delete')}
                          >
                            <IconTrash size={12} />
                          </ActionIcon>
                        </Tooltip>
                      </Group>
                    </Group>
                    <Text size="sm" c="dimmed" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {r.email ?? t('common.dash')}
                    </Text>
                    {r.phone && (
                      <Text size="sm" c="dimmed">{r.phone}</Text>
                    )}
                  </Stack>
                </Group>
              </Paper>
            ))}
          </SimpleGrid>
        )
      )}

      <CreateResourceModal open={modalOpen} onClose={() => setModalOpen(false)} />
      <DeleteResourceConfirmModal
        open={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        resourceName={deleteTarget ? `${deleteTarget.firstName} ${deleteTarget.lastName}` : ''}
        isPending={deleteMutation.isPending}
        onConfirm={async () => {
          if (!deleteTarget) return
          try {
            await deleteMutation.mutateAsync(deleteTarget.id)
            setDeleteTarget(null)
          } catch (err: unknown) {
            notifications.show({ message: apiErrorMessageForMutation(err, t, 'deleteResource.error'), color: 'red' })
          }
        }}
      />
    </Stack>
  )
}

export default ResourcesPage
