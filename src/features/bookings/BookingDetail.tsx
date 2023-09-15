import styled from 'styled-components'
import { useNavigate } from 'react-router-dom'
import { BookingType } from '../../types/booking.type'

import { useMoveBack } from '../../hooks/useMoveBack'
import useCheckout from '../check-in-out/useCheckout'
import useDeleteBooking from './useDeleteBooking'

import BookingDataBox from './BookingDataBox'
import Row from '../../ui/Row'
import Heading from '../../ui/Heading'
import Tag from '../../ui/Tag'
import ButtonGroup from '../../ui/ButtonGroup'
import Button from '../../ui/Button'
import ButtonText from '../../ui/ButtonText'
import { useBooking } from './useBooking'
import Spinner from '../../ui/Spinner'
import Modal from '../../ui/Modal'
import ConfirmDelete from '../../ui/ConfirmDelete'

const HeadingGroup = styled.div`
  display: flex;
  gap: 2.4rem;
  align-items: center;
`

function BookingDetail() {
  const navigate = useNavigate()
  const moveBack = useMoveBack()
  const { booking, isLoading } = useBooking()
  const { checkoutMutate, isCheckingOut } = useCheckout()
  const { deleteBookingMutate, isDeleting } = useDeleteBooking()

  if (isLoading) return <Spinner />

  const { id: bookingId, status } = booking as BookingType

  const statusToTagName = {
    unconfirmed: 'blue',
    'checked-in': 'green',
    'checked-out': 'silver'
  } as const

  return (
    <>
      <Row type='horizontal'>
        <HeadingGroup>
          <Heading as='h1'>Booking #{bookingId}</Heading>
          <Tag type={statusToTagName[status]}>{status.replace('-', ' ')}</Tag>
        </HeadingGroup>
        <ButtonText onClick={moveBack}>&larr; Back</ButtonText>
      </Row>

      <BookingDataBox booking={booking as BookingType} />

      <ButtonGroup>
        {status === 'unconfirmed' && (
          <Button onClick={() => navigate(`/checkin/${bookingId}`)}>Check in</Button>
        )}
        {status === 'checked-in' && (
          <Button
            disabled={isCheckingOut}
            onClick={() => {
              checkoutMutate(bookingId)
            }}
          >
            Check out
          </Button>
        )}
        <Modal>
          <Modal.Open opens='delete'>
            <Button $variation='danger'>Delete</Button>
          </Modal.Open>
          <Modal.Window name='delete'>
            <ConfirmDelete
              resourceName='booking'
              disabled={isDeleting}
              onConfirm={() => deleteBookingMutate(bookingId, { onSettled: () => navigate(-1) })}
            />
          </Modal.Window>
        </Modal>
        <Button $variation='secondary' onClick={moveBack}>
          Back
        </Button>
      </ButtonGroup>
    </>
  )
}

export default BookingDetail
