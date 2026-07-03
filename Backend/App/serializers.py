from rest_framework import serializers
from .models import Evento, Inscripcion

class EventoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Evento
        fields = [
            'id', 'title', 'description', 'eventType', 'startDate', 'endDate',
            'maxAttendees', 'inscriptionPolicy', 'organizador'
        ]

    def validate(self, data):
        start = data.get('startDate')
        end = data.get('endDate')
        max_att = data.get('maxAttendees')

        if start and end and start >= end:
            raise serializers.ValidationError('startDate must be before endDate')
        if max_att is not None and max_att <= 0:
            raise serializers.ValidationError('maxAttendees must be greater than 0')
        return data

class InscripcionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Inscripcion
        fields = ['id', 'usuario', 'evento', 'fecha_inscripcion']
