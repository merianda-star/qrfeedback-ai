export type Question = {
  id: number
  text: string
  type: 'star' | 'open' | 'mc'
  required: boolean
  preloaded: boolean
  options?: string[] // for mc type
  showOnNegative?: boolean // custom questions shown only on negative path
}

const restaurantQuestions: Question[] = [
  { id: 1, text: 'How would you rate the quality of your food today?', type: 'star', required: true, preloaded: true },
  { id: 2, text: 'How satisfied were you with the speed of service?', type: 'star', required: true, preloaded: true },
  { id: 3, text: 'How would you rate the friendliness of our staff?', type: 'star', required: false, preloaded: true },
  { id: 4, text: 'How clean was the restaurant during your visit?', type: 'star', required: false, preloaded: true },
  { id: 5, text: 'How likely are you to visit us again?', type: 'star', required: false, preloaded: true },
  { id: 6, text: 'How likely are you to recommend us to a friend or family?', type: 'star', required: false, preloaded: true },
  { id: 7, text: 'What did you enjoy most about your visit today?', type: 'open', required: false, preloaded: true },
  { id: 8, text: 'Is there anything specific we could have done better?', type: 'open', required: false, preloaded: true },
  { id: 9, text: 'What was the main issue with your visit?', type: 'mc', required: true, preloaded: false, showOnNegative: true,
    options: ['Food quality', 'Wait time was too long', 'Staff service', 'Cleanliness', 'Pricing / Value'] },
]

const retailQuestions: Question[] = [
  { id: 1, text: 'How would you rate the quality of the products you purchased?', type: 'star', required: true, preloaded: true },
  { id: 2, text: 'How satisfied were you with the assistance from our staff?', type: 'star', required: true, preloaded: true },
  { id: 3, text: 'How easy was it to find what you were looking for?', type: 'star', required: false, preloaded: true },
  { id: 4, text: 'How would you rate the overall store environment?', type: 'star', required: false, preloaded: true },
  { id: 5, text: 'How satisfied were you with the checkout experience?', type: 'star', required: false, preloaded: true },
  { id: 6, text: 'How likely are you to shop with us again?', type: 'star', required: false, preloaded: true },
  { id: 7, text: 'What did you enjoy most about your shopping experience?', type: 'open', required: false, preloaded: true },
  { id: 8, text: 'What could we improve to make your next visit better?', type: 'open', required: false, preloaded: true },
  { id: 9, text: 'What was the main issue during your visit?', type: 'mc', required: true, preloaded: false, showOnNegative: true,
    options: ['Product quality', 'Staff assistance', 'Product availability', 'Store cleanliness', 'Pricing / Value'] },
]

const eventsQuestions: Question[] = [
  { id: 1, text: 'How would you rate the overall quality of the event?', type: 'star', required: true, preloaded: true },
  { id: 2, text: 'How satisfied were you with the event organisation and timing?', type: 'star', required: true, preloaded: true },
  { id: 3, text: 'How would you rate the venue and facilities?', type: 'star', required: false, preloaded: true },
  { id: 4, text: 'How helpful and professional was the event staff?', type: 'star', required: false, preloaded: true },
  { id: 5, text: 'How would you rate the value for money of this event?', type: 'star', required: false, preloaded: true },
  { id: 6, text: 'How likely are you to attend our future events?', type: 'star', required: false, preloaded: true },
  { id: 7, text: 'What was the highlight of the event for you?', type: 'open', required: false, preloaded: true },
  { id: 8, text: 'What could we have done to make the event better?', type: 'open', required: false, preloaded: true },
  { id: 9, text: 'What was the main issue with this event?', type: 'mc', required: true, preloaded: false, showOnNegative: true,
    options: ['Event organisation', 'Venue / Facilities', 'Timing / Schedule', 'Staff behaviour', 'Value for money'] },
]

const serviceQuestions: Question[] = [
  { id: 1, text: 'How would you rate the quality of the service you received?', type: 'star', required: true, preloaded: true },
  { id: 2, text: 'How satisfied were you with the response time?', type: 'star', required: true, preloaded: true },
  { id: 3, text: 'How professional and knowledgeable was our team?', type: 'star', required: false, preloaded: true },
  { id: 4, text: 'How well did we understand and address your needs?', type: 'star', required: false, preloaded: true },
  { id: 5, text: 'How satisfied were you with the outcome of the service?', type: 'star', required: false, preloaded: true },
  { id: 6, text: 'How likely are you to use our services again?', type: 'star', required: false, preloaded: true },
  { id: 7, text: 'What did we do particularly well?', type: 'open', required: false, preloaded: true },
  { id: 8, text: 'What could we improve about our service?', type: 'open', required: false, preloaded: true },
  { id: 9, text: 'What was the main issue with our service?', type: 'mc', required: true, preloaded: false, showOnNegative: true,
    options: ['Response time', 'Service quality', 'Staff professionalism', 'Communication', 'Pricing / Value'] },
]

const defaultQuestions: Question[] = [
  { id: 1, text: 'How would you rate your overall experience?', type: 'star', required: true, preloaded: true },
  { id: 2, text: 'How satisfied were you with the service you received?', type: 'star', required: true, preloaded: true },
  { id: 3, text: 'How professional was our team?', type: 'star', required: false, preloaded: true },
  { id: 4, text: 'How would you rate the value for money?', type: 'star', required: false, preloaded: true },
  { id: 5, text: 'How easy was it to interact with us?', type: 'star', required: false, preloaded: true },
  { id: 6, text: 'How likely are you to recommend us to others?', type: 'star', required: false, preloaded: true },
  { id: 7, text: 'What did you enjoy most about your experience?', type: 'open', required: false, preloaded: true },
  { id: 8, text: 'What could we have done better?', type: 'open', required: false, preloaded: true },
  { id: 9, text: 'What was the main issue you experienced?', type: 'mc', required: true, preloaded: false, showOnNegative: true,
    options: ['Quality of service', 'Response time', 'Staff behaviour', 'Communication', 'Pricing / Value'] },
]

export function getQuestions(businessType: string): Question[] {
  switch (businessType) {
    case 'restaurant': return restaurantQuestions
    case 'retail': return retailQuestions
    case 'events': return eventsQuestions
    case 'service': return serviceQuestions
    default: return defaultQuestions
  }
}

export const starLabels = ['', 'Terrible 😞', 'Poor 😕', 'Average 😐', 'Great 😊', 'Amazing 🤩']