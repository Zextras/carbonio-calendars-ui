/*
 * SPDX-FileCopyrightText: 2021 Zextras <https://www.zextras.com>
 *
 * SPDX-License-Identifier: AGPL-3.0-only
 */
import { Icon, Padding, Row, Text } from '@zextras/carbonio-design-system';
import React from 'react';

export const LocationRow = ({ event, showIcon = false }) =>
	event?.resource?.class !== 'PRI' && (
		<>
			{event.resource.location && event.resource.location.length > 0 && (
				<Row width="fill" mainAlignment="flex-start" padding={{ top: 'small' }}>
					<Row takeAvailableSpace mainAlignment="flex-start">
						{showIcon && (
							<Padding right="small">
								<Icon icon="PinOutline" size="medium" />
							</Padding>
						)}
						<Row takeAvailableSpace mainAlignment="flex-start">
							<Text color="gray1" size="small">
								{event.resource.locationUrl ? (
									<a href={event.resource.locationUrl} target="_blank" rel="noreferrer">
										{event.resource.location}
									</a>
								) : (
									event.resource.location
								)}
							</Text>
						</Row>
					</Row>
				</Row>
			)}
		</>
	);
