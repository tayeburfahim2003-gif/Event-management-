import { useEffect, useState, useCallback } from 'react';
import { Card, Form, Button, Alert, Spinner, Badge } from 'react-bootstrap';
import { FaStar, FaRegStar, FaCommentDots } from 'react-icons/fa';
import API, { getErrorMessage } from '../services/api';

function StarRating({ value, onChange, readOnly = false }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="mb-2">
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = star <= (hover || value);
        return (
          <span
            key={star}
            onClick={() => !readOnly && onChange(star)}
            onMouseEnter={() => !readOnly && setHover(star)}
            onMouseLeave={() => !readOnly && setHover(0)}
            style={{ cursor: readOnly ? 'default' : 'pointer', fontSize: '1.4rem', marginRight: 4 }}
            className="text-warning"
          >
            {filled ? <FaStar /> : <FaRegStar />}
          </span>
        );
      })}
    </div>
  );
}

/**
 * Shows an event's average rating + all reviews, and (if the viewer has an
 * eligible registration passed in via `registration`) a form to leave feedback.
 */
function FeedbackSection({ eventId, registration, onFeedbackSubmitted }) {
  const [summary, setSummary] = useState({ averageRating: 0, totalReviews: 0, reviews: [] });
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await API.get(`/events/${eventId}/feedback`);
      setSummary(res.data.data);
    } catch (err) {
      // non-fatal — just show no reviews
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    load();
  }, [load]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!rating) {
      setError('Please select a star rating.');
      return;
    }
    setBusy(true);
    setError('');
    setSuccess('');
    try {
      await API.put(`/registrations/${registration._id}/feedback`, { rating, comment });
      setSuccess('Thanks for your feedback!');
      setRating(0);
      setComment('');
      await load();
      if (onFeedbackSubmitted) onFeedbackSubmitted();
    } catch (err) {
      setError(getErrorMessage(err, 'Could not submit feedback'));
    } finally {
      setBusy(false);
    }
  };

  const canReview = registration && !registration.feedbackSubmitted && registration.attendanceStatus !== 'cancelled';

  return (
    <Card className="mt-3 border-success">
      <Card.Body>
        <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-2">
          <h5 className="mb-0">
            <FaCommentDots className="me-2 text-success" /> Feedback &amp; Ratings
          </h5>
          {summary.totalReviews > 0 && (
            <div>
              <StarRating value={Math.round(summary.averageRating)} onChange={() => {}} readOnly />
              <span className="text-muted small ms-1">
                {summary.averageRating} / 5 ({summary.totalReviews} review{summary.totalReviews !== 1 ? 's' : ''})
              </span>
            </div>
          )}
        </div>

        {canReview && (
          <Form onSubmit={handleSubmit} className="p-3 bg-light rounded border mb-3">
            {error && <Alert variant="danger" className="py-2">{error}</Alert>}
            {success && <Alert variant="success" className="py-2">{success}</Alert>}
            <Form.Label className="fw-semibold">Rate this event</Form.Label>
            <StarRating value={rating} onChange={setRating} />
            <Form.Group className="mb-2">
              <Form.Control
                as="textarea"
                rows={2}
                placeholder="Share your thoughts about this event (optional)"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />
            </Form.Group>
            <Button variant="success" size="sm" type="submit" disabled={busy}>
              {busy ? 'Submitting...' : 'Submit Feedback'}
            </Button>
          </Form>
        )}

        {registration?.feedbackSubmitted && (
          <Alert variant="light" className="border py-2">You've already reviewed this event. Thanks!</Alert>
        )}

        {loading ? (
          <div className="text-center py-3">
            <Spinner animation="border" size="sm" variant="success" />
          </div>
        ) : summary.reviews.length === 0 ? (
          <p className="text-muted mb-0">No reviews yet.</p>
        ) : (
          summary.reviews.map((review) => (
            <div key={review._id} className="border-top pt-2 mt-2">
              <div className="d-flex align-items-center gap-2">
                <strong>{review.user?.name || 'Anonymous'}</strong>
                <Badge bg="light" text="dark" className="border">
                  {review.rating} <FaStar className="text-warning" style={{ marginBottom: 2 }} />
                </Badge>
                <span className="text-muted small">{new Date(review.date).toLocaleDateString()}</span>
              </div>
              {review.comment && <p className="mb-0 mt-1">{review.comment}</p>}
            </div>
          ))
        )}
      </Card.Body>
    </Card>
  );
}

export default FeedbackSection;
