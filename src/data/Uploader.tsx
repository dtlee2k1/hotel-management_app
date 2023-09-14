import { useState } from 'react'
import { isFuture, isPast, isToday } from 'date-fns'
import supabase from '../services/supabase'
import Button from '../ui/Button'
import { subtractDates } from '../utils/helpers'

import SettingsType from '../types/settings.type'

import { bookings } from './data-bookings'
import { cabins } from './data-cabins'
import { guests } from './data-guests'
import GuestType from '../types/guest.type'
import CabinType from '../types/cabin.type'

const originalSettings: SettingsType = {
  minBookingLength: 3,
  maxBookingLength: 30,
  maxGuestsPerBooking: 10,
  breakfastPrice: 15
}

async function deleteGuests() {
  const { error } = await supabase.from('guests').delete().gt('id', 0)
  if (error) console.log(error.message)
}

async function deleteCabins() {
  const { error } = await supabase.from('cabins').delete().gt('id', 0)
  if (error) console.log(error.message)
}

async function deleteBookings() {
  const { error } = await supabase.from('bookings').delete().gt('id', 0)
  if (error) console.log(error.message)
}

async function createGuests() {
  const { error } = await supabase.from('guests').insert(guests)
  if (error) console.log(error.message)
}

async function createCabins() {
  const { error } = await supabase.from('cabins').insert(cabins)
  if (error) console.log(error.message)
}

async function createBookings() {
  // Bookings need a guestId and a cabinId. We can't tell Supabase IDs for each object, it will calculate them on its own. So it might be different for different people, especially after multiple uploads. Therefore, we need to first get all guestIds and cabinIds, and then replace the original IDs in the booking data with the actual ones from the DB
  const { data: guestsIds } = await supabase.from('guests').select('id').order('id')
  const allGuestIds = (guestsIds as Pick<GuestType, 'id'>[]).map((cabin) => cabin.id)
  const { data: cabinsIds } = await supabase.from('cabins').select('id').order('id')
  const allCabinIds = (cabinsIds as Pick<CabinType, 'id'>[]).map((cabin) => cabin.id)

  const finalBookings = bookings.map((booking) => {
    // Here relying on the order of cabins, as they don't have and ID yet
    const cabin: CabinType = cabins[booking.cabinId - 1]
    const numNights = subtractDates(booking.endDate as string, booking.startDate as string)
    const cabinPrice = numNights * (cabin.regularPrice - cabin.discount)
    const extrasPrice = booking.hasBreakfast ? numNights * 15 * booking.numGuests : 0 // hardcoded breakfast price
    const totalPrice = cabinPrice + extrasPrice

    let status
    if (
      isPast(new Date(booking.endDate as string)) &&
      !isToday(new Date(booking.endDate as string))
    )
      status = 'checked-out'
    if (
      isFuture(new Date(booking.startDate as string)) ||
      isToday(new Date(booking.startDate as string))
    )
      status = 'unconfirmed'
    if (
      (isFuture(new Date(booking.endDate as string)) ||
        isToday(new Date(booking.endDate as string))) &&
      isPast(new Date(booking.startDate as string)) &&
      !isToday(new Date(booking.startDate as string))
    )
      status = 'checked-in'

    return {
      ...booking,
      numNights,
      cabinPrice,
      extrasPrice,
      totalPrice,
      guestId: allGuestIds.at(booking.guestId - 1),
      cabinId: allCabinIds.at(booking.cabinId - 1),
      status
    }
  })

  const { error } = await supabase.from('bookings').insert(finalBookings)
  if (error) console.log(error.message)
}

function Uploader() {
  const [isLoading, setIsLoading] = useState<boolean>(false)

  async function uploadAll() {
    setIsLoading(true)
    // Bookings need to be deleted FIRST
    await deleteBookings()
    await deleteGuests()
    await deleteCabins()

    // Bookings need to be created LAST
    await createGuests()
    await createCabins()
    await createBookings()

    setIsLoading(false)
  }

  async function uploadBookings() {
    setIsLoading(true)
    await deleteBookings()
    await createBookings()
    setIsLoading(false)
  }

  return (
    <div
      style={{
        marginTop: 'auto',
        backgroundColor: '#e0e7ff',
        padding: '8px',
        borderRadius: '5px',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        gap: '8px'
      }}
    >
      <h3>SAMPLE DATA</h3>

      <Button onClick={uploadAll} disabled={isLoading}>
        Upload ALL
      </Button>

      <Button onClick={uploadBookings} disabled={isLoading}>
        Upload bookings ONLY
      </Button>
    </div>
  )
}

export default Uploader