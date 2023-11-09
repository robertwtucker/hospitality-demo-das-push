/**
 * Copyright (c) 2023 Quadient Group AG
 * SPDX-License-Identifier: MIT
 */

export function getDescription(): ScriptDescription {
  return {
    description: 'Script to send push notifications with Digital Advantage.',
    icon: '',
    input: [
      {
        id: 'inputDataPath',
        displayName: 'Input data file path',
        description: 'Path to the data file to read input from (JSON format).',
        type: 'InputResource',
        required: true,
      },
      {
        id: 'dasConnector',
        displayName: 'DAS connector',
        description:
          'The web endpoint connector configured with the URL of Digital Advantage instance to use.',
        defaultValue: '/api/publish/MobileBackend/SendNotifications',
        type: 'Connector',
        required: true,
      },
      {
        id: 'applicationId',
        displayName: 'Application ID',
        description: 'The Digital Advantage application identifier.',
        type: 'String',
        required: true,
      },
      {
        id: 'messageTitle',
        displayName: 'Message title',
        description: 'The title of the message to send.',
        defaultValue: 'Push Notification',
        type: 'String',
        required: true,
      },
      {
        id: 'messageContent',
        displayName: 'Message content',
        description: 'The content of the message to be sent.',
        defaultValue: 'A new document is available.',
        type: 'String',
        required: true,
      },
      {
        id: 'documentId',
        displayName: 'Document ID',
        description: 'The ID of the document sent along with the notification.',
        type: 'String',
        required: true,
      },
    ],
  }
}

export async function execute(context: Context): Promise<void> {
  const input = await readInputFile(context)
  await sendPushNotification(context, input.Clients[0].Reservation)
}

async function readInputFile(context: Context): Promise<InvoicePayload> {
  const inputData = await context
    .getFile(context.parameters.inputDataPath as string)
    .read()
  return JSON.parse(inputData)
}

async function sendPushNotification(
  context: Context,
  data: Reservation,
): Promise<void> {
  console.log(
    'Sending push notification for document: ',
    context.parameters.documentId,
  )

  const body = {
    applicationId: context.parameters.applicationId as string,
    notifications: [
      {
        clientIds: [data.guestClientId],
        isSilent: true,
        message: context.parameters.messageContent as string,
        title: context.parameters.messageTitle as string,
        content: {
          documentId: context.parameters.documentId as string,
        },
      },
    ],
  }

  const headers = new Headers({
    'Content-Type': 'application/json',
    Accept: 'application/json',
  })

  const response = await fetch(context.parameters.dasConnector as string, {
    method: 'POST',
    headers: headers,
    body: JSON.stringify(body),
  })

  const json = await response.json()
  if (response.ok) {
    console.log('Successfully queued push notification: ', JSON.stringify(json))
  } else {
    throw new Error(
      `Non-OK DAS API response: ${response.status} ${
        response.statusText
      }:${JSON.stringify(json)}`,
    )
  }
}

export interface InvoicePayload {
  Clients: Client[]
}

export interface Client {
  ClientID: string
  Reservation: Reservation
  sendEmail: boolean
  feedback: string
}

export interface Reservation {
  id: number
  hotel: Hotel
  confirmationNumber: number
  guests: number
  creditPrefix: number
  creditSuffix: number
  points: number
  checkInDate: string
  checkOutDate: string
  checkedIn: boolean
  guestName: string
  guestEmail: string
  guestClientId: string
}

export interface Hotel {
  id: number
  name: string
  location: string
  imageName: string
  checkInTime: string
  checkOutTime: string
  rating: number
  conciergeUrl: string
}
