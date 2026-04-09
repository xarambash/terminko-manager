import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Button,
  Card,
  DataTable,
  DataTableBodyRow,
  DataTableEmptyCell,
  DataTableHeadRow,
  DataTableScroll,
  DataTableTd,
  DataTableTh,
  GuestActionPlaceholderModal,
  ListSearchField,
  PageSectionHeader,
  QueryStatusBanner,
} from '../components'
import { matchesTableSearch } from '../lib/tableSearch'
import { useGuests } from '../hooks'
import type { Guest } from '../types/guests'

const pageClass = 'flex flex-1 flex-col gap-4 p-4 text-left sm:gap-6 sm:p-6 md:gap-8 md:p-8'

function formatDate(iso: string | null, locale: string) {
  if (!iso) return null
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return null
  return d.toLocaleDateString(locale, { day: 'numeric', month: 'short', year: 'numeric' })
}

function GuestsPage() {
  const { t, i18n } = useTranslation()
  const { data: guests, isPending, isError, error } = useGuests()
  const [search, setSearch] = useState('')
  const [modal, setModal] = useState<{ guest: Guest; action: 'ban' | 'unban' } | null>(null)

  const sorted = useMemo(() => {
    const list = [...(guests ?? [])]
    list.sort((a, b) => a.name.localeCompare(b.name))
    return list
  }, [guests])

  const filtered = useMemo(
    () =>
      sorted.filter((g) =>
        matchesTableSearch(search, [g.name, g.email, g.phone, g.notes ?? ''])
      ),
    [sorted, search]
  )

  const locale = i18n.language === 'sr' ? 'sr-Latn-RS' : 'en-GB'

  return (
    <main className={pageClass}>
      <div className="flex flex-col gap-4">
        <PageSectionHeader title={t('guests.title')} />
        <ListSearchField
          id="guests-search"
          value={search}
          onChange={setSearch}
        />
      </div>

      <QueryStatusBanner
        isPending={isPending}
        isError={isError}
        error={error}
        loadingText={t('loading.guests')}
      />

      {!isPending && !isError && (
        <Card className="overflow-hidden p-0">
          <DataTableScroll variant="page">
            <DataTable variant="page" minWidth={960}>
              <thead>
                <DataTableHeadRow variant="page">
                  <DataTableTh variant="page">{t('common.name')}</DataTableTh>
                  <DataTableTh variant="page">{t('common.email')}</DataTableTh>
                  <DataTableTh variant="page">{t('common.phone')}</DataTableTh>
                  <DataTableTh variant="page">{t('guests.penaltyPoints')}</DataTableTh>
                  <DataTableTh variant="page">{t('common.status')}</DataTableTh>
                  <DataTableTh variant="page">{t('guests.bannedUntil')}</DataTableTh>
                  <DataTableTh variant="page" align="right">
                    {t('common.actions')}
                  </DataTableTh>
                </DataTableHeadRow>
              </thead>
              <tbody>
                {sorted.length === 0 ? (
                  <tr>
                    <DataTableEmptyCell variant="page" colSpan={7}>
                      {t('guests.empty')}
                    </DataTableEmptyCell>
                  </tr>
                ) : filtered.length === 0 ? (
                  <tr>
                    <DataTableEmptyCell variant="page" colSpan={7}>
                      {t('common.emptySearch')}
                    </DataTableEmptyCell>
                  </tr>
                ) : (
                  filtered.map((g) => (
                    <DataTableBodyRow key={g.id}>
                      <DataTableTd variant="page" className="text-[var(--text-h)]">
                        {g.name}
                      </DataTableTd>
                      <DataTableTd variant="page" className="text-[var(--text)]">
                        {g.email}
                      </DataTableTd>
                      <DataTableTd variant="page" className="text-[var(--text)]">
                        {g.phone}
                      </DataTableTd>
                      <DataTableTd variant="page" className="text-[var(--text)]">
                        {g.penaltyPoints}
                      </DataTableTd>
                      <DataTableTd variant="page" className="text-[var(--text)]">
                        {g.isBanned ? t('guests.statusBanned') : t('guests.statusActive')}
                      </DataTableTd>
                      <DataTableTd variant="page" className="text-[var(--text)]">
                        {g.isBanned && g.bannedUntil
                          ? formatDate(g.bannedUntil, locale) ?? t('common.dash')
                          : t('common.dash')}
                      </DataTableTd>
                      <DataTableTd variant="page" align="right">
                        <div className="flex justify-end gap-2">
                          <Button
                            type="button"
                            variant="secondary"
                            className="px-3 py-1.5 text-xs"
                            disabled={g.isBanned}
                            onClick={() => setModal({ guest: g, action: 'ban' })}
                          >
                            {t('guests.ban.action')}
                          </Button>
                          <Button
                            type="button"
                            variant="secondary"
                            className="px-3 py-1.5 text-xs"
                            disabled={!g.isBanned}
                            onClick={() => setModal({ guest: g, action: 'unban' })}
                          >
                            {t('guests.unban.action')}
                          </Button>
                        </div>
                      </DataTableTd>
                    </DataTableBodyRow>
                  ))
                )}
              </tbody>
            </DataTable>
          </DataTableScroll>
        </Card>
      )}

      <GuestActionPlaceholderModal
        open={modal != null}
        onClose={() => setModal(null)}
        guestName={modal?.guest.name ?? ''}
        action={modal?.action ?? 'ban'}
      />
    </main>
  )
}

export default GuestsPage
